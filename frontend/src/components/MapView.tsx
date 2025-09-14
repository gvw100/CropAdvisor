// src/components/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";
import "leaflet/dist/leaflet.css";

// Use bundler-resolved URLs for images
import icon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Build a concrete icon once
const defaultIcon = new L.Icon({
  iconRetinaUrl: icon2xUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],      // Leaflet defaults
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

type Props = {
  lat?: number | null;
  lon?: number | null;
  label?: string;
  height?: number | string;
  zoom?: number;
};

export default function MapView({ lat, lon, label, height = 320, zoom = 11 }: Props) {
  const hasCoords = typeof lat === "number" && typeof lon === "number";
  const center = useMemo<[number, number]>(() => (hasCoords ? [lat!, lon!] : [20, 0]), [hasCoords, lat, lon]);

  return (
    <div style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <MapContainer center={center} zoom={hasCoords ? zoom : 2} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {hasCoords && (
          <Marker position={center} icon={defaultIcon}>
            <Popup>{label ?? `${lat!.toFixed(4)}, ${lon!.toFixed(4)}`}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
