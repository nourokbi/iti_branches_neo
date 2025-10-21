import { useMapEvents } from "react-leaflet";

// Component to handle map clicks
export default function ClickHandler({ onPickCoordinate }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPickCoordinate({ lat, lng });
    },
  });
  return null;
}
