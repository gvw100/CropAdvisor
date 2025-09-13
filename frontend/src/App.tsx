import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";

type Coords = { lat: number; lon: number };

export default function App() {
  const [coords, setCoords] = useState<Coords | null>(null);

  function useMyLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          console.log("Did not get user's location data");
        }
      );
    }
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

      <main style={{ padding: "16px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#334155" }}>
          {coords ? `${coords.lat}, ${coords.lon}` : "Pick a location"}
        </p>
      </main>
    </div>
  );
}
