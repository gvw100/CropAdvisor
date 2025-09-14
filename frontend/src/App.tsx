import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import CropSelect, { type Crop } from "./components/CropSelect";
import { useNavigate } from "react-router-dom";
import MapView from "./components/MapView";

type Coords = { lat: number; lon: number };

export default function App() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [crop, setCrop] = useState<Crop>("Corn");
  const navigate = useNavigate();

  function useMyLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.log("Did not get user's location data")
      );
    }
  }

  function goToAdvisory() {
    if (!coords) return;
    navigate(
      `/advisory?lat=${coords.lat}&lon=${coords.lon}&crop=${encodeURIComponent(crop)}`
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header pinned at top */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "80vw",
            maxWidth: 960,
          }}
        >
          {/* Search bar expands */}
          <div style={{ flex: 1 }}>
            <SearchBar
              onSelect={(loc) => setCoords({ lat: loc.lat, lon: loc.lon })}
            />
          </div>

          {/* Button on the right */}
          <button
            onClick={useMyLocation}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Use my location
          </button>
        </div>
      </header>

      {/* Row 2: crop select + generate button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "80vw",
            maxWidth: 960,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <CropSelect value={crop} onChange={setCrop} />

          <button
            onClick={goToAdvisory}
            disabled={!coords}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: !coords ? "#cbd5e1" : "#16a34a",
              color: "white",
              fontWeight: 600,
              cursor: !coords ? "not-allowed" : "pointer",
              opacity: !coords ? 0.7 : 1,
            }}
            title={!coords ? "Pick a location first" : "Generate advisory"}
          >
            Generate advisory
          </button>
        </div>
      </div>

      <main style={{ padding: "16px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#334155" }}>
          {coords ? `${coords.lat}, ${coords.lon}` : "Pick a location"} · Crop: {crop}
        </p>
      </main>

      <div
    style={{
      marginTop: 16,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      color: "#1e293b",
    }}
  >
    <h2 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>Map</h2>
    <MapView
      lat={coords?.lat ?? null}
      lon={coords?.lon ?? null}
      label={coords ? "Selected location" : undefined}
      height={360}
      zoom={11}
    />
  </div>
    </div>
  );
}
