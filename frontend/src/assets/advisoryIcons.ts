import OpacityIcon from "@mui/icons-material/Opacity";      // irrigation
import ScienceIcon from "@mui/icons-material/Science";       // fungal risk
import AcUnitIcon from "@mui/icons-material/AcUnit";         // frost risk
import AirIcon from "@mui/icons-material/Air";               // wind caution
import WbSunnyIcon from "@mui/icons-material/WbSunny";       // heat stress
import InfoIcon from "@mui/icons-material/Info";             // general

export const advisoryIconByType: Record<string, React.ElementType> = {
  irrigation: OpacityIcon,
  fungal_risk: ScienceIcon,
  frost_risk: AcUnitIcon,
  wind_caution: AirIcon,
  heat_stress: WbSunnyIcon,
  general: InfoIcon,
};
