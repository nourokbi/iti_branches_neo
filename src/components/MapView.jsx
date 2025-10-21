import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  WMSTileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import { useEffect, useState } from "react";

// Import utilities and configurations
import "./map/leafletSetup";
import ClickHandler from "./map/ClickHandler";
import FitBounds from "./map/FitBounds";
import { fetchBranches, fetchWfsData, MAP_CONFIG } from "./map/mapUtils";
import {
  pointToLayer,
  onEachFeature,
  wfsPointToLayer,
  wfsStyledPointToLayer,
  wfsOnEachFeature,
} from "./map/mapStyles";

export default function MapView({
  mode = "home",
  theme = "dark",
  onPickCoordinate,
  selectedCoords,
  reloadKey,
}) {
  const [branchesData, setBranchesData] = useState(null);
  const [wfsData, setWfsData] = useState(null);

  // Basemap URLs based on theme
  const basemapUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // Fetch branches data for home mode
  useEffect(() => {
    const loadBranches = async () => {
      const data = await fetchBranches();
      if (data) setBranchesData(data);
    };
    loadBranches();
  }, [reloadKey]);

  // Fetch WFS data from GeoServer for WFS modes
  useEffect(() => {
    if (mode === "wfs" || mode === "wtfs-styled") {
      const loadWfsData = async () => {
        const data = await fetchWfsData();
        if (data) setWfsData(data);
      };
      loadWfsData();
    }
  }, [mode]);

  return (
    <div className="app-map">
      <MapContainer
        key="main-map"
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer key={theme} url={basemapUrl} />

        {/* Home mode: Show branches GeoJSON and click functionality */}
        {mode === "home" && (
          <>
            {branchesData && (
              <>
                <GeoJSON
                  key={`geojson-${reloadKey}-${branchesData.timestamp}`}
                  data={branchesData}
                  pointToLayer={pointToLayer}
                  onEachFeature={onEachFeature}
                />
                <FitBounds data={branchesData} />
              </>
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
            url={MAP_CONFIG.wmsUrl}
            layers={MAP_CONFIG.wmsLayer}
            format="image/png"
            transparent={true}
            version="1.1.0"
            attribution="GeoServer WMS"
          />
        )}

        {/* WFS mode: Show WFS GeoJSON from GeoServer (simple blue styling) */}
        {mode === "wfs" && wfsData && (
          <>
            <GeoJSON
              key={`wfs-${Date.now()}`}
              data={wfsData}
              pointToLayer={wfsPointToLayer}
              onEachFeature={wfsOnEachFeature}
            />
            <FitBounds data={wfsData} />
          </>
        )}

        {/* WFS Styled mode: Custom styling based on Tracks field */}
        {mode === "wtfs-styled" && wfsData && (
          <>
            <GeoJSON
              key={`wfs-styled-${Date.now()}`}
              data={wfsData}
              pointToLayer={wfsStyledPointToLayer}
              onEachFeature={wfsOnEachFeature}
            />
            <FitBounds data={wfsData} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
