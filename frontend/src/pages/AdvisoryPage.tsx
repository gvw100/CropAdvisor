// src/pages/AdvisoryPage.tsx
import { useSearchParams, Link } from "react-router-dom";

export default function AdvisoryPage() {
  const [params] = useSearchParams();
  const lat = params.get("lat");
  const lon = params.get("lon");
  const crop = params.get("crop");

  const hasAll = lat && lon && crop;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px", color: "#1e293b" }}>
        <div style={{ marginBottom: 12 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#2563eb" }}>
            ← Back
          </Link>
        </div>

        <h1 style={{ margin: 0, color: "#0f172a" }}>Crop Advisory</h1>

        {!hasAll ? (
          <p style={{ color: "#b91c1c" }}>
            Missing parameters. Please select a location and crop on the home page.
          </p>
        ) : (
          <>
            <p>
              <strong>Location:</strong> {lat}, {lon}
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
              <em>Dashboard coming soon…</em>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
