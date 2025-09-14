// src/pages/AdvisoryPage.tsx
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdvisoryList from "../components/AdvisoryList";
import WeatherChart from "../components/WeatherChart";
import { mock } from "./MockAdvisory";
import type { Advisory } from "../types/advisory";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type DayPoint = {
  dt: number;      // unix seconds
  tMin: number;
  tMax: number;
  rainMm: number;
  pop: number;     // 0..1
};

export default function AdvisoryPage() {
  const [params] = useSearchParams();
  const lat = params.get("lat");
  const lon = params.get("lon");
  const crop = params.get("crop");

  const hasAll = lat && lon && crop;

  const [loadingAdvisories, setLoadingAdvisories] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const [daily, setDaily] = useState<DayPoint[]>([]);

  useEffect(() => {
    if (!hasAll) return;
    setLoadingAdvisories(true);
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
        setAdvisories(mock); // fallback to mock
        setLocationLabel(`${lat}, ${lon}`);
      } finally {
        setLoadingAdvisories(false);
      }
    })();
  }, [lat, lon, crop, hasAll]);

  useEffect(() => {
    if (!hasAll) return;
    setLoadingChart(true);
    (async () => {
      try {
        const res = await fetch(`${API_URL}/forecast_chart?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        setDaily(Array.isArray(data?.daily) ? data.daily : []);
      } catch (err) {
        console.error("Failed to fetch forecast chart", err);
        setDaily([]); 
      } finally {
        setLoadingChart(false);
      }
    })();
  }, [lat, lon, hasAll]);

  return (
  <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
    {/* Top wrapper for back + heading + meta */}
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
        </>
      )}
    </div>

    {/* Wide section for advisories + chart */}
    {hasAll && (
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            width: "min(92vw, 1400px)",
            margin: "0 auto",
            display: "grid",
            gap: 16,
          }}
        >
          {/* Advisories card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              color: "#1e293b",
              minHeight: 80,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>
              Advisories
            </h2>
            {loadingAdvisories ? (
              <p style={{ color: "#64748b" }}>Loading…</p>
            ) : (
              <AdvisoryList advisories={advisories} />
            )}
          </div>

          {/* Chart card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              color: "#1e293b",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>
              5-Day Outlook
            </h2>
            {loadingChart ? (
              <p style={{ color: "#64748b" }}>Loading…</p>
            ) : daily.length ? (
              <WeatherChart daily={daily} />
            ) : (
              <p style={{ color: "#64748b" }}>
                No forecast series available for this location.
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

}
