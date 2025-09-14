// src/components/AdvisoryList.tsx
import Box from "@mui/material/Box";
import AdvisoryCard from "./AdvisoryCard";
import type { Advisory } from "../types/advisory";

export default function AdvisoryList({ advisories }: { advisories: Advisory[] }) {
  if (!advisories?.length) {
    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          color: "#1e293b",
        }}
      >
        No specific advisories today. 👍
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gap: 2, // theme spacing
        // 1 col on phones, 2 on small screens, 3 on md+, 4 on xl
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          xl: "repeat(4, minmax(0, 1fr))",
        },
        alignItems: "stretch",
      }}
    >
      {advisories.map((a) => (
        <AdvisoryCard key={a.id} a={a} />
      ))}
    </Box>
  );
}
