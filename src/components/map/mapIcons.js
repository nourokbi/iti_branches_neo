import L from "leaflet";

// Create custom icon for branches (Home mode) - Orange pin with graduation cap
export const createBranchIcon = () => {
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
              fill="url(#orangeGrad)" stroke="#ea580c" stroke-width="2"/>
        <circle cx="12" cy="11" r="6" fill="white" opacity="0.95"/>
        <!-- Graduation cap icon -->
        <path d="M12 7l-4 1.5v2.5c0 1.5 1.5 2.5 4 2.5s4-1 4-2.5v-2.5l-4-1.5z" fill="#ea580c"/>
        <rect x="11.2" y="13" width="1.6" height="3" fill="#ea580c"/>
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
export const createWfsStyledIcon = (trackValue) => {
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
