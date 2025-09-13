import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

type Suggestion = { label: string; lat: number; lon: number };
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function SearchBar({ onSelect }: { onSelect: (s: Suggestion) => void }) {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    const q = input.trim();
    if (!q) { setItems([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/locations?location=${encodeURIComponent(q)}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : (data?.results ?? []));
      } catch {
        setItems([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [input]);

  const labels = items.map(i => i.label);

  return (
    <Autocomplete
      options={labels}
      freeSolo
      renderInput={(params) => <TextField {...params} label="Location name" fullWidth />}
      onInputChange={(_, v) => setInput(v)}
      onChange={(_, v) => {
        if (typeof v === "string") {
          const m = items.find(i => i.label === v);
          if (m) onSelect(m);
        }
      }}
      sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}  // wide + centered
    />
  );
}
