import "./App.css";
import Navbar from "./components/Navbar";
import BranchesForm from "./components/BranchesForm";
import MapView from "./components/MapView";
import { useState } from "react";

function App() {
  const [mode, setMode] = useState("home"); // 'home' | 'wms' | 'wps' | 'wps-styled'

  return (
    <>
      <Navbar onNavigate={setMode} />
      <MapView mode={mode} />
      {mode === "home" ? <BranchesForm /> : null}
    </>
  );
}

export default App;
