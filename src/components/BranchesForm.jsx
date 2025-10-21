import { useEffect, useState } from "react";
import { User, Route, MapPin, Crosshair, Loader2 } from "lucide-react";
import "./BranchesForm.css";
import Toast from "./Toast";

export default function BranchesForm({ selectedCoords, onCreated }) {
  const [form, setForm] = useState({ name: "", track: "", x: "", y: "" });
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (
      selectedCoords &&
      typeof selectedCoords.lat === "number" &&
      typeof selectedCoords.lng === "number"
    ) {
      setForm((prev) => ({
        ...prev,
        x: selectedCoords.lng.toFixed(6),
        y: selectedCoords.lat.toFixed(6),
      }));
    }
  }, [selectedCoords]);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = (form.name || "").trim();
    const track = (form.track || "").trim();
    const X = parseFloat(form.x);
    const Y = parseFloat(form.y);
    if (!name || !track || Number.isNaN(X) || Number.isNaN(Y)) {
      setToast({
        message: "Please fill all fields with valid values.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:2711/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Branch: name, X, Y, Tracks: track }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.message || "Failed to create branch");
      // Notify parent to reload map
      onCreated && onCreated(data);
      // Clear only the name; keep coords & track for convenience
      setForm((prev) => ({ ...prev, name: "" }));
      setToast({
        message: `Branch "${name}" created successfully! 🎉`,
        type: "success",
      });
    } catch (err) {
      console.error("Create branch failed", err);
      setToast({
        message: err.message || "Error creating branch. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="branch-form-section"
      aria-labelledby="branch-form-title"
    >
      <h2 id="branch-form-title" className="form-title">
        Add New Branch
      </h2>
      <form className="branch-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <div className="input-wrap">
            <span className="icon" aria-hidden>
              <User size={18} />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Branch name"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="track">Track</label>
          <div className="input-wrap">
            <span className="icon" aria-hidden>
              <Route size={18} />
            </span>
            <input
              id="track"
              name="track"
              type="text"
              placeholder="e.g., GIS, AI"
              required
              value={form.track}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="x">X Coordinate</label>
            <div className="input-wrap">
              <span className="icon" aria-hidden>
                <MapPin size={18} />
              </span>
              <input
                id="x"
                name="x"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="e.g., 31.2357"
                required
                value={form.x}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="y">Y Coordinate</label>
            <div className="input-wrap">
              <span className="icon" aria-hidden>
                <MapPin size={18} />
              </span>
              <input
                id="y"
                name="y"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="e.g., 30.0444"
                required
                value={form.y}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} /> Submitting...
              </>
            ) : (
              <>Create Branch</>
            )}
          </button>
        </div>
      </form>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </section>
  );
}
