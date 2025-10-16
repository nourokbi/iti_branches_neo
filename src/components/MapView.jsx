import { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

/**
 * MapView props contract
 * - mode: 'home' | 'wms' | 'wfs' | 'wtfs-styled'
 * - wmsConfig?: { url: string; layers: string; format?: string; transparent?: boolean; version?: string; styles?: string; sld?: string }
 * - wfsConfig?: { apiBase: string; typeName: string }
 * - onPickCoordinate?: (latlng: {lat:number, lng:number}) => void
 */
export default function MapView({
  mode = "home",
  wmsConfig,
  wfsConfig,
  onPickCoordinate,
}) {
  const mapRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const baseLayerRef = useRef(null);
  const lastThemeRef = useRef(null);
  const clickHandlerRef = useRef(null);

  // Helpers to choose and apply base layers based on theme
  const isDarkMode = useCallback(
    () => document.documentElement.classList.contains("dark"),
    []
  );

  const createTileLayerForTheme = useCallback(
    (isDark) =>
      isDark
        ? L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              maxZoom: 19,
            }
          )
        : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
          }),
    []
  );

  const applyBaseLayer = useCallback(
    (isDark) => {
      const map = mapRef.current;
      if (!map) return;
      if (lastThemeRef.current === isDark) return;
      lastThemeRef.current = isDark;
      if (baseLayerRef.current) {
        try {
          map.removeLayer(baseLayerRef.current);
        } catch {
          // ignore
        }
      }
      const base = createTileLayerForTheme(isDark).addTo(map);
      baseLayerRef.current = base;
    },
    [createTileLayerForTheme]
  );

  // Initialize map once (idempotent creation)
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("app-map", {
        center: [28.0444, 30.2357], // Cairo as a neutral default
        zoom: 7,
        zoomControl: false, // we'll add custom control position
      });
      mapRef.current = map;
      // Zoom controls at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);
      // Initialize a single overlay group to hold all dynamic layers
      const group = L.layerGroup().addTo(map);
      overlayGroupRef.current = group;
    }

    // Apply initial base according to current theme
    applyBaseLayer(isDarkMode());
  }, [applyBaseLayer, isDarkMode]);

  // Attach listeners for theme changes and resize
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Observe theme changes on html element
    const htmlObserver = new MutationObserver(() => {
      applyBaseLayer(isDarkMode());
      map.invalidateSize();
    });
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      htmlObserver.disconnect();
    };
  }, [applyBaseLayer, isDarkMode]);

  // update overlays when mode or configs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1) Clear previous overlays from the group
    if (overlayGroupRef.current) {
      try {
        overlayGroupRef.current.clearLayers();
      } catch {
        /* ignore */
      }
    }

    // 2) Remove any previous click handler (home mode)
    if (clickHandlerRef.current) {
      try {
        map.off("click", clickHandlerRef.current);
      } catch {
        /* ignore */
      }
      clickHandlerRef.current = null;
    }

    if (mode === "wms" && wmsConfig?.url && wmsConfig?.layers) {
      const {
        url,
        layers,
        format = "image/png",
        transparent = true,
        version = "1.1.1",
        styles,
        sld,
      } = wmsConfig;
      const wmsOpts = { layers, format, transparent, version };
      if (styles) wmsOpts.styles = styles;
      if (sld) wmsOpts.sld = sld;
      L.tileLayer.wms(url, wmsOpts).addTo(overlayGroupRef.current);
    } else if (mode === "wfs" || mode === "wtfs-styled") {
      // Fetch WFS via backend proxy and add as GeoJSON
      if (wfsConfig?.apiBase && wfsConfig?.typeName) {
        const u = new URL(`${wfsConfig.apiBase}/api/wfs/items`);
        u.searchParams.set("typeName", wfsConfig.typeName);
        u.searchParams.set("srsName", "EPSG:4326");
        u.searchParams.set("limit", "500");
        fetch(u)
          .then((r) => r.json())
          .then((data) => {
            const styled = mode === "wtfs-styled";
            const getStyle = (feature) => {
              if (!styled)
                return {
                  color: "#7c6bf2",
                  weight: 2,
                  fillColor: "#7c6bf255",
                  fillOpacity: 0.5,
                };
              const t = (feature?.properties?.track ?? "")
                .toString()
                .toLowerCase();
              const palette = {
                north: "#7ef1ff",
                south: "#ff7ee0",
                east: "#7c6bf2",
                west: "#ffc857",
                default: "#4ade80",
              };
              const color = palette[t] || palette.default;
              return {
                color,
                weight: 2,
                fillColor: `${color}55`,
                fillOpacity: 0.5,
              };
            };
            const gj = L.geoJSON(data, { style: getStyle }).addTo(
              overlayGroupRef.current
            );
            try {
              map.fitBounds(gj.getBounds(), { padding: [20, 20] });
            } catch {
              /* ignore */
            }
          })
          .catch((err) => console.error("WFS load error", err));
      }
    } else if (mode === "home") {
      // Enable click to pick coordinates into the form
      const clickHandler = (e) => {
        onPickCoordinate && onPickCoordinate(e.latlng);
      };
      map.on("click", clickHandler);
      clickHandlerRef.current = clickHandler;
    } else {
      // other modes: no overlays
    }
  }, [mode, wmsConfig, wfsConfig, onPickCoordinate]);

  return <div id="app-map" className="app-map" />;
}
