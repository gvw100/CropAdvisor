import type { Advisory } from "../types/advisory";

export const mock: Advisory[] = [
  {
    id: "demo1",
    type: "irrigation",
    severity: "medium",
    title: "Irrigation advisable",
    reason: "Hot & dry window (max 31°C; low rain next 48h).",
    action: "Irrigate early; check soil moisture and avoid runoff.",
    tags: ["heat", "water"],
  },
  {
    id: "demo2",
    type: "fungal_risk",
    severity: "high",
    title: "Fungal disease risk",
    reason: "Humid conditions with heavy rain expected (12 mm, RH 88%).",
    action: "Scout susceptible areas; consider preventive fungicide spray.",
    tags: ["disease", "moisture"],
  },
  {
    id: "demo3",
    type: "frost_risk",
    severity: "low",
    title: "Light frost risk",
    reason: "Nighttime lows near 2 °C in the next 48h.",
    action: "Cover seedlings or use row covers in low-lying areas.",
    tags: ["cold", "protection"],
  },
  {
    id: "demo4",
    type: "wind_caution",
    severity: "medium",
    title: "Windy for spraying",
    reason: "Peak wind gusts 6.5 m/s expected tomorrow afternoon.",
    action: "Avoid spraying during windy hours; reschedule if possible.",
    tags: ["drift", "spraying"],
  },
  {
    id: "demo5",
    type: "heat_stress",
    severity: "high",
    title: "Heat stress warning",
    reason: "Temperatures may exceed 35 °C for 2 consecutive days.",
    action: "Irrigate in early morning and monitor crops for wilting.",
    tags: ["heat", "stress"],
  },
];