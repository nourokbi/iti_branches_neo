import "./App.css";
import Navbar from "./components/Navbar";
import BranchesForm from "./components/BranchesForm";
import MapView from "./components/MapView";
import { useState } from "react";

function App() {
  const [mode, setMode] = useState("home");
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [theme, setTheme] = useState("dark");

  const handleNavClick = (navKey) => {
    setMode(navKey);
    // Clear selected coords when switching modes
    setSelectedCoords(null);
  };

  const handlePickCoordinate = (coords) => {
    setSelectedCoords(coords);
  };

  const handleBranchCreated = () => {
    setReloadKey((k) => k + 1);
    // Clear the picked marker after successful creation
    setSelectedCoords(null);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <>
      <MapView
        mode={mode}
        theme={theme}
        onPickCoordinate={mode === "home" ? handlePickCoordinate : null}
        selectedCoords={selectedCoords}
        reloadKey={reloadKey}
      />
      <Navbar onNavigate={handleNavClick} onThemeChange={handleThemeChange} />
      {mode === "home" && (
        <BranchesForm
          selectedCoords={selectedCoords}
          onCreated={handleBranchCreated}
        />
      )}
    </>
  );
}

export default App;
