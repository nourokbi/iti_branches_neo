import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { Earth, Moon, Sun } from "lucide-react";

export default function Navbar({ onNavigate }) {
  const headerRef = useRef(null);
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  function handleThemeChange() {
    // Use functional update to avoid stale state
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore write errors (private mode, etc.)
    }
  }, [theme]);

  // Publish navbar height as a CSS variable to avoid page scrolling
  useEffect(() => {
    function updateNavbarHeightVar() {
      const el = headerRef.current;
      if (!el) return;
      const styles = getComputedStyle(el);
      const mt = parseFloat(styles.marginTop) || 0;
      const mb = parseFloat(styles.marginBottom) || 0;
      const h = el.offsetHeight + mt + mb;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    }
    updateNavbarHeightVar();
    window.addEventListener("resize", updateNavbarHeightVar);
    return () => window.removeEventListener("resize", updateNavbarHeightVar);
  }, []);

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
            {/* Handle navigation */}
            <li>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("home");
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#wms"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("wms");
                }}
              >
                WMS
              </a>
            </li>
            <li>
              <a
                href="#wps"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("wps");
                }}
              >
                WPS
              </a>
            </li>
            <li>
              <a
                href="#wps-styled"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("wps-styled");
                }}
              >
                WPS Styled
              </a>
            </li>
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
