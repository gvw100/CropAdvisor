export type Severity = "low" | "medium" | "high";
export type AdvisoryType =
  | "irrigation"
  | "fungal_risk"
  | "frost_risk"
  | "wind_caution"
  | "heat_stress"
  | "general";

export interface Advisory {
  id: string;
  type: AdvisoryType;
  severity: Severity;
  title: string;
  reason: string;
  action: string;
  tags?: string[];
}
