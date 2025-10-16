import "./App.css";
import Navbar from "./components/Navbar";
import BranchesForm from "./components/BranchesForm";
import MapView from "./components/MapView";
import { useState } from "react";

function App() {
  const [mode, setMode] = useState("home"); // 'home' | 'wms' | 'wfs' | 'wtfs-styled'
  const [selectedCoords, setSelectedCoords] = useState(null); // { lat, lng }

  // Simple configs (adjust to your GeoServer setup)
  const WFS_LAYER = "iti:iTi Branches"; // layer name from GeoServer
  const API_BASE = "http://localhost:8000"; // Flask API base
  const WMS_CONFIG = {
    url: "http://localhost:8085/geoserver/iti/wms",
    layers: "iti:iTi Branches",
    // Optional: provide a named style or SLD param
    // styles: "your_sld_style_name",
    // sld: "http://your-server/style.sld",
  };

  return (
    <>
      <Navbar
        onNavigate={(m) => {
          setMode(m);
        }}
      />
      <MapView
        mode={mode}
        onPickCoordinate={(latlng) => setSelectedCoords(latlng)}
        wmsConfig={WMS_CONFIG}
        wfsConfig={{ apiBase: API_BASE, typeName: WFS_LAYER }}
      />
      {mode === "home" ? (
        <BranchesForm selectedCoords={selectedCoords} />
      ) : null}
    </>
  );
}

export default App;
