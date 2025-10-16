import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { Earth, Moon, Sun } from "lucide-react";

export default function Navbar({ onNavigate }) {
  const headerRef = useRef(null);

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* ignore storage errors */
    }
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  function handleThemeChange() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  // Removed navbar height variable publishing as it's not needed for this project

  const navItems = [
    { key: "home", label: "Home" },
    { key: "wms", label: "WMS" },
    { key: "wfs", label: "WFS" },
    { key: "wtfs-styled", label: "WFS Styled" },
  ];

  const isDark = theme === "dark";

  return (
    <header ref={headerRef}>
      <div className="container">
        <a className="brand" href="#home" aria-label="GeoScope home">
          <span className="brand-badge" aria-hidden="true">
            <Earth size={18} />
          </span>
          <span className="brand-wordmark">GeoScope</span>
        </a>
        <nav className="navbar">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={`#${item.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate(item.key);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="theme-changer">
          {/* Accessible theme switcher */}
          <div className="theme-switch">
            <input
              id="themeToggle"
              type="checkbox"
              className="theme-switch-input"
              checked={isDark}
              onChange={handleThemeChange}
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode"
            />
            <label htmlFor="themeToggle" className="theme-switch-label">
              <span className="theme-switch-track" />
              <span className="theme-switch-thumb">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
