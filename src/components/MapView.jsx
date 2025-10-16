import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

/**
 * MapView props contract
 * - mode: 'home' | 'wms' | 'wps' | 'wps-styled'
 * - wmsConfig?: { url: string; layers: string; format?: string; transparent?: boolean; version?: string }
 * - wpsData?: GeoJSON.FeatureCollection | null (placeholder; usually fetched)
 */
export default function MapView({ mode = "home", wmsConfig, wpsData }) {
  const mapRef = useRef(null);
  const overlaysRef = useRef({});
  const baseLayerRef = useRef(null);
  const lastThemeRef = useRef(null);

  // initialize map once
  useEffect(() => {
    if (mapRef.current) return; // already created

    const map = L.map("app-map", {
      center: [30.0444, 31.2357], // Cairo as a neutral default
      zoom: 12,
      zoomControl: false, // we'll add custom control position
    });
    mapRef.current = map;

    // Zoom controls at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Setup base layer depending on theme
    const createTileLayerForTheme = (isDark) =>
      isDark
        ? L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              maxZoom: 20,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }
          )
        : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          });

    const applyBaseLayer = (isDark) => {
      if (lastThemeRef.current === isDark) return;
      lastThemeRef.current = isDark;
      // remove previous base
      if (baseLayerRef.current) {
        try {
          map.removeLayer(baseLayerRef.current);
        } catch {
          // ignore
        }
      }
      const base = createTileLayerForTheme(isDark).addTo(map);
      baseLayerRef.current = base;
    };

    // Initial base layer based on body class
    applyBaseLayer(document.body.classList.contains("dark"));

    // Observe theme changes on body class
    const observer = new MutationObserver(() => {
      applyBaseLayer(document.body.classList.contains("dark"));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Resize safety: ensure map fits container when navbar height changes
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  // update overlays when mode or configs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear previous overlays
    Object.values(overlaysRef.current).forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch {
        // ignore removal errors
      }
    });
    overlaysRef.current = {};

    if (mode === "wms" && wmsConfig?.url && wmsConfig?.layers) {
      const {
        url,
        layers,
        format = "image/png",
        transparent = true,
        version = "1.1.1",
      } = wmsConfig;
      const wms = L.tileLayer
        .wms(url, {
          layers,
          format,
          transparent,
          version,
        })
        .addTo(map);
      overlaysRef.current["wms"] = wms;
    } else if (mode === "wps" || mode === "wps-styled") {
      // Draw GeoJSON from WPS (placeholder: use provided wpsData or a demo feature)
      const data = wpsData ?? {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Demo area" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [31.2, 30.05],
                  [31.26, 30.05],
                  [31.26, 30.01],
                  [31.2, 30.01],
                  [31.2, 30.05],
                ],
              ],
            },
          },
        ],
      };

      const styleBase = {
        color: mode === "wps-styled" ? "#ff7ee0" : "#7c6bf2",
        weight: 2,
        fillColor: mode === "wps-styled" ? "#ff7ee055" : "#7c6bf255",
        fillOpacity: 0.5,
      };
      const gj = L.geoJSON(data, { style: styleBase }).addTo(map);
      overlaysRef.current["wps"] = gj;

      try {
        map.fitBounds(gj.getBounds(), { padding: [20, 20] });
      } catch {
        // ignore fitBounds when geometry is invalid/empty
      }
    } else {
      // home mode: no overlays, maybe reset view softly
      // keep current view to avoid jarring UX; you can reset if needed
    }
  }, [mode, wmsConfig, wpsData]);

  return <div id="app-map" className="app-map" />;
}
