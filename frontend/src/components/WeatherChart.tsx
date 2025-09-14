// src/components/WeatherChart.tsx
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, ComposedChart, ResponsiveContainer
} from "recharts";

type DayPoint = {
  dt: number;    // unix timestamp
  tMin: number;
  tMax: number;
  rainMm: number;
  pop: number;
};

export default function WeatherChart({ daily }: { daily: DayPoint[] }) {
  // convert unix -> day label
  const data = daily.map(d => ({
    date: new Date(d.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
    tMin: Math.round(d.tMin),
    tMax: Math.round(d.tMax),
    rain: d.rainMm,
    pop: Math.round(d.pop * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Rain / POP", angle: -90, position: "insideRight" }} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="right" dataKey="rain" barSize={20} fill="#38bdf8" name="Rain (mm)" />
        <Line yAxisId="left" type="monotone" dataKey="tMax" stroke="#ef4444" name="Max °C" />
        <Line yAxisId="left" type="monotone" dataKey="tMin" stroke="#3b82f6" name="Min °C" />
        <Line yAxisId="right" type="monotone" dataKey="pop" stroke="#facc15" name="POP %" strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
