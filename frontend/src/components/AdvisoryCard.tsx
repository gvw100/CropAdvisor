import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { advisoryIconByType } from "../assets/advisoryIcons";
import type { Advisory } from "../types/advisory";

const cardBgBySeverity: Record<"low"|"medium"|"high", string> = {
  low:    "#ecfeff",
  medium: "#fff7ed",
  high:   "#fee2e2",
};

const chipColor = (sev: Advisory["severity"]) =>
  sev === "high" ? "error" : sev === "medium" ? "warning" : "default";

export default function AdvisoryCard({ a }: { a: Advisory }) {
  const Icon = advisoryIconByType[a.type] ?? advisoryIconByType["general"];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        background: cardBgBySeverity[a.severity] ?? "#fff",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Icon fontSize="small" />
        <div style={{ fontWeight: 600 }}>{a.title}</div>
        <Chip
          size="small"
          label={a.severity}
          color={chipColor(a.severity)}
          sx={{ ml: "auto", textTransform: "capitalize" }}
        />
      </div>

      {/* Reason */}
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
        {a.reason}
      </div>

      {/* Action */}
      <div style={{ fontSize: 14, marginTop: 8 }}>
        <strong>Action:</strong> {a.action}
      </div>

      {/* Tags */}
      {a.tags?.length ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {a.tags.map((t) => (
            <Tooltip key={t} title={t}>
              <Chip size="small" variant="outlined" label={t} />
            </Tooltip>
          ))}
        </div>
      ) : null}
    </Paper>
  );
}
