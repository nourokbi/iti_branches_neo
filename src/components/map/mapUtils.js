// API endpoint URLs
export const API_ENDPOINTS = {
  branches: "http://localhost:2711/branches",
  wfs: "http://localhost:8085/geoserver/iti/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=iti%3AiTi%20Branches&outputFormat=application%2Fjson&maxFeatures=50",
};

// Default map configuration
export const MAP_CONFIG = {
  center: [29.0444, 29.2357], // Egypt coordinates
  zoom: 7,
  wmsUrl: "http://localhost:8085/geoserver/iti/wms",
  wmsLayer: "iti:iTi Branches",
};

// Fetch branches data from backend API
export const fetchBranches = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.branches);
    const json = await res.json();

    if (json.status === "success" && Array.isArray(json.data)) {
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

      return {
        type: "FeatureCollection",
        features: features,
        timestamp: Date.now(),
      };
    }
    return null;
  } catch (err) {
    console.error("Error fetching branches:", err);
    return null;
  }
};

// Fetch WFS data from GeoServer
export const fetchWfsData = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.wfs);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching WFS data:", err);
    return null;
  }
};
