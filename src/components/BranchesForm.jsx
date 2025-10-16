import { useEffect, useState } from "react";
import { User, Route, MapPin, Crosshair, Loader2 } from "lucide-react";
import "./BranchesForm.css";

export default function BranchesForm({ selectedCoords }) {
  const [form, setForm] = useState({ name: "", track: "", x: "", y: "" });
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
    // Placeholder submit behavior; integrate with backend later
    setLoading(true);
    try {
      // TODO: replace with API call
      await new Promise((r) => setTimeout(r, 900));
      console.log("Branch submitted:", form);
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
              placeholder="e.g., North Line"
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
                <Crosshair size={18} />
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
    </section>
  );
}
