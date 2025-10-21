import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  useMapEvents,
  CircleMarker,
  WMSTileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default markers in React Leaflet v4
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map clicks
function ClickHandler({ onPickCoordinate }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPickCoordinate({ lat, lng });
    },
  });
  return null;
}

export default function MapView({
  mode = "home",
  onPickCoordinate,
  selectedCoords,
  reloadKey,
}) {
  const position = [28.5444, 29.2357]; // Egypt coordinates
  const [branchesData, setBranchesData] = useState(null);
  const [wfsData, setWfsData] = useState(null);

  useEffect(() => {
    // Fetch branches data from API
    fetch("http://localhost:2711/branches")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success" && Array.isArray(json.data)) {
          // Convert to GeoJSON format
          const features = json.data.map((branch) => ({
            type: "Feature",
            geometry: branch.geom || {
              type: "Point",
              coordinates: [branch.X, branch.Y],
            },
            properties: {
              Branch: branch.Branch,
              Tracks: branch.Tracks,
            },
          }));

          setBranchesData({
            type: "FeatureCollection",
            features: features,
            timestamp: Date.now(), // Force new object reference
          });
        }
      })
      .catch((err) => console.error("Error fetching branches:", err));
  }, [reloadKey]);

  // Fetch WFS data from GeoServer
  useEffect(() => {
    if (mode === "wfs" || mode === "wtfs-styled") {
      fetch(
        "http://localhost:8085/geoserver/iti/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=iti%3AiTi%20Branches&outputFormat=application%2Fjson&maxFeatures=50"
      )
        .then((res) => res.json())
        .then((data) => {
          setWfsData(data);
        })
        .catch((err) => console.error("Error fetching WFS data:", err));
    }
  }, [mode]);

  // Create custom icon for branches (Home mode) - Smaller orange pin with graduation cap
  const createBranchIcon = () => {
    return L.divIcon({
      html: `
        <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#fb923c;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M12 0C5.372 0 0 5.372 0 12c0 9 12 20 12 20s12-11 12-20C24 5.372 18.628 0 12 0z" 
                fill="url(#orangeGrad)" stroke="#ae4710ff" stroke-width="2"/>
          <circle cx="12" cy="11" r="6" fill="white" opacity="0.95"/>
          <!-- Graduation cap icon -->
          <path d="M12 7l-4 1.5v2.5c0 1.5 1.5 2.5 4 2.5s4-1 4-2.5v-2.5l-4-1.5z" fill="#a6430eff"/>
          <rect x="11.2" y="13" width="1.6" height="3" fill="#622505ff"/>
          <circle cx="13.5" cy="15" r="0.8" fill="#ea580c"/>
        </svg>
      `,
      className: "custom-branch-icon",
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });
  };

  // Create custom icon for WFS Styled (color based on track value)
  const createWfsStyledIcon = (trackValue) => {
    // Define color scheme for different tracks
    const trackColors = {
      // Null or empty track - Red
      null: {
        color1: "#f87171",
        color2: "#ef4444",
        stroke: "#dc2626",
        icon: "✗",
        name: "No Track",
      },
      // GIS Track - Green
      GIS: {
        color1: "#34d399",
        color2: "#10b981",
        stroke: "#059669",
        icon: "G",
        name: "GIS",
      },
      // AI Track - Purple
      AI: {
        color1: "#a78bfa",
        color2: "#8b5cf6",
        stroke: "#7c3aed",
        icon: "A",
        name: "AI",
      },
      // MERN Track - Blue
      MERN: {
        color1: "#60a5fa",
        color2: "#3b82f6",
        stroke: "#2563eb",
        icon: "M",
        name: "MERN",
      },
      // SysAdmin Track - Orange
      SysAdmin: {
        color1: "#fb923c",
        color2: "#f97316",
        stroke: "#ea580c",
        icon: "S",
        name: "SysAdmin",
      },
      // Default for unknown tracks
      default: {
        color1: "#94a3b8",
        color2: "#64748b",
        stroke: "#475569",
        icon: "?",
        name: "Other",
      },
    };

    // Normalize track value
    const track = trackValue?.trim() || "";
    const colorScheme = trackColors[track] || trackColors["default"];

    // Use null styling if empty
    if (!track) {
      const nullScheme = trackColors["null"];
      const gradId = `grad-null`;

      return L.divIcon({
        html: `
          <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${nullScheme.color1};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${nullScheme.color2};stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10 14 22 14 22s14-12 14-22C28 6.268 21.732 0 14 0z" 
                  fill="url(#${gradId})" stroke="${nullScheme.stroke}" stroke-width="2"/>
            <circle cx="14" cy="13" r="7.5" fill="white" opacity="0.95"/>
            <circle cx="14" cy="13" r="6" fill="${nullScheme.color2}" opacity="0.15"/>
            <text x="14" y="17" font-family="Arial, sans-serif" font-size="10" font-weight="bold" 
                  text-anchor="middle" fill="${nullScheme.stroke}">${nullScheme.icon}</text>
          </svg>
        `,
        className: "custom-wfs-styled-icon no-track",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      });
    }

    // Create icon with track-specific color
    const gradId = `grad-${colorScheme.color2.replace("#", "")}`;

    return L.divIcon({
      html: `
        <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${colorScheme.color1};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colorScheme.color2};stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10 14 22 14 22s14-12 14-22C28 6.268 21.732 0 14 0z" 
                fill="url(#${gradId})" stroke="${colorScheme.stroke}" stroke-width="2"/>
          <circle cx="14" cy="13" r="7.5" fill="white" opacity="0.95"/>
          <circle cx="14" cy="13" r="6" fill="${colorScheme.color2}" opacity="0.15"/>
          <text x="14" y="17" font-family="Arial, sans-serif" font-size="10" font-weight="bold" 
                text-anchor="middle" fill="${colorScheme.stroke}">${colorScheme.icon}</text>
        </svg>
      `,
      className: "custom-wfs-styled-icon",
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -36],
    });
  };

  // Style function for GeoJSON points (Home mode)
  const pointToLayer = (feature, latlng) => {
    return L.marker(latlng, { icon: createBranchIcon() });
  };

  // Popup function for each feature
  const onEachFeature = (feature, layer) => {
    const { Branch, Tracks } = feature.properties;
    const trackText = Tracks && Tracks.trim() !== "" ? Tracks : "No Track";
    layer.bindPopup(`<b>${Branch}</b><br/>Track: ${trackText}`);
  };

  // WFS style function - simple blue circle markers
  const wfsPointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#3b82f6",
      color: "#2563eb",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
    });
  };

  // WFS Styled - Custom styling based on Tracks field
  const wfsStyledPointToLayer = (feature, latlng) => {
    const trackValue = feature.properties.Tracks;
    return L.marker(latlng, { icon: createWfsStyledIcon(trackValue) });
  };

  // WFS popup function
  const wfsOnEachFeature = (feature, layer) => {
    const { Branch, Tracks } = feature.properties;
    const trackText = Tracks && Tracks.trim() !== "" ? Tracks : "No Track";
    const trackStatus =
      Tracks && Tracks.trim() !== "" ? "✅ Has Track" : "❌ No Track";

    layer.bindPopup(`
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${Branch}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Track:</strong> ${trackText}
        </p>
        <p style="margin: 4px 0; font-size: 13px;">
          ${trackStatus}
        </p>
      </div>
    `);
  };

  return (
    <div className="app-map">
      <MapContainer
        key="main-map"
        center={position}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        // whenReady={() => console.log("Map is ready")}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Home mode: Show branches GeoJSON and click functionality */}
        {mode === "home" && (
          <>
            {branchesData && (
              <GeoJSON
                key={`geojson-${reloadKey}-${branchesData.timestamp}`}
                data={branchesData}
                pointToLayer={pointToLayer}
                onEachFeature={onEachFeature}
              />
            )}
            {onPickCoordinate && (
              <ClickHandler onPickCoordinate={onPickCoordinate} />
            )}
            {selectedCoords && (
              <CircleMarker
                center={[selectedCoords.lat, selectedCoords.lng]}
                radius={12}
                pathOptions={{
                  fillColor: "#22c55e",
                  color: "#16a34a",
                  weight: 3,
                  opacity: 1,
                  fillOpacity: 0.7,
                }}
              >
                <Popup>
                  <b>New Branch Location</b>
                  <br />
                  Lat: {selectedCoords.lat.toFixed(6)}
                  <br />
                  Lng: {selectedCoords.lng.toFixed(6)}
                </Popup>
              </CircleMarker>
            )}
          </>
        )}

        {/* WMS mode: Show WMS layer from GeoServer */}
        {mode === "wms" && (
          <WMSTileLayer
            url="http://localhost:8085/geoserver/iti/wms"
            layers="iti:iTi Branches"
            format="image/png"
            transparent={true}
            version="1.1.0"
            attribution="GeoServer WMS"
          />
        )}

        {/* WFS mode: Show WFS GeoJSON from GeoServer (simple blue styling) */}
        {mode === "wfs" && wfsData && (
          <GeoJSON
            key={`wfs-${Date.now()}`}
            data={wfsData}
            pointToLayer={wfsPointToLayer}
            onEachFeature={wfsOnEachFeature}
          />
        )}

        {/* WFS Styled mode: Custom styling based on Tracks field */}
        {mode === "wtfs-styled" && wfsData && (
          <GeoJSON
            key={`wfs-styled-${Date.now()}`}
            data={wfsData}
            pointToLayer={wfsStyledPointToLayer}
            onEachFeature={wfsOnEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
