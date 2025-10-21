import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Component that automatically fits map bounds to display all features
 * @param {Object} data - GeoJSON data to fit bounds to
 * @param {number} padding - Padding around bounds in pixels
 */
export default function FitBounds({ data, padding = 50 }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !data.features || data.features.length === 0) {
      return;
    }

    try {
      // Create a temporary GeoJSON layer to calculate bounds
      const geoJsonLayer = L.geoJSON(data);
      const bounds = geoJsonLayer.getBounds();

      // Check if bounds are valid
      if (bounds.isValid()) {
        // Fit the map to the bounds with padding
        // Extra padding on top to account for navbar (70px)
        // Extra padding on right to account for form when visible (30px)
        map.fitBounds(bounds, {
          paddingTopLeft: [padding, padding + 40], // [left, top]
          paddingBottomRight: [padding, padding], // [right, bottom]
          maxZoom: 15, // Don't zoom in too close
          animate: true,
          duration: 0.5,
        });
      }
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [data, map, padding]);

  return null; // This component doesn't render anything
}
