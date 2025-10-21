import L from "leaflet";
import { createBranchIcon, createWfsStyledIcon } from "./mapIcons";

// Style function for GeoJSON points (Home mode)
export const pointToLayer = (feature, latlng) => {
  return L.marker(latlng, { icon: createBranchIcon() });
};

// Popup function for home mode features
export const onEachFeature = (feature, layer) => {
  const { Branch, Tracks } = feature.properties;
  const trackText = Tracks && Tracks.trim() !== "" ? Tracks : "No Track";
  layer.bindPopup(`<b>${Branch}</b><br/>Track: ${trackText}`);
};

// WFS style function - simple blue circle markers
export const wfsPointToLayer = (feature, latlng) => {
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
export const wfsStyledPointToLayer = (feature, latlng) => {
  const trackValue = feature.properties.Tracks;
  return L.marker(latlng, { icon: createWfsStyledIcon(trackValue) });
};

// WFS popup function with enhanced styling
export const wfsOnEachFeature = (feature, layer) => {
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
