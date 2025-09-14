// src/pages/AdvisoryPage.tsx
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdvisoryList from "../components/AdvisoryList";
import { mock } from "./MockAdvisory";
import type { Advisory } from "../types/advisory";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function AdvisoryPage() {
  const [params] = useSearchParams();
  const lat = params.get("lat");
  const lon = params.get("lon");
  const crop = params.get("crop");

  const hasAll = lat && lon && crop;
  const [loading, setLoading] = useState(false);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAll) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/advisory?lat=${lat}&lon=${lon}&crop=${encodeURIComponent(
            crop!
          )}`
        );
        const data = await res.json();
        setAdvisories(data.advisories ?? []);
        setLocationLabel(data.location?.label ?? `${lat}, ${lon}`);
      } catch (err) {
        console.error("Failed to fetch advisories", err);
        // fallback to mock if error
        setAdvisories(mock);
        setLocationLabel(`${lat}, ${lon}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon, crop, hasAll]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "16px",
          color: "#1e293b",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#2563eb" }}>
            ← Back
          </Link>
        </div>

        <h1 style={{ margin: 0, color: "#0f172a" }}>Crop Advisor</h1>

        {!hasAll ? (
          <p style={{ color: "#b91c1c" }}>
            Missing parameters. Please select a location and crop on the home page.
          </p>
        ) : (
          <>
            <p>
              <strong>Location:</strong> {locationLabel ?? `${lat}, ${lon}`}
            </p>
            <p>
              <strong>Crop:</strong> {crop}
            </p>
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
              <h2 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>
                Advisories
              </h2>
              {loading ? (
                <p style={{ color: "#64748b" }}>Loading…</p>
              ) : (
                <AdvisoryList advisories={advisories} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
