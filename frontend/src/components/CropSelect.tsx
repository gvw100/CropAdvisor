import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const CROPS = ["corn", "soybeans", "wheat", "rice", "barley", "canola"] as const;
export type Crop = (typeof CROPS)[number];

export default function CropSelect({
  value,
  onChange,
}: {
  value: Crop;
  onChange: (c: Crop) => void;
}) {
  return (
    <FormControl sx={{ minWidth: 180 }}>
      <InputLabel id="crop-label">Crop</InputLabel>
      <Select<Crop>
        labelId="crop-label"
        id="crop-select"
        label="Crop"
        value={value}
        onChange={(e) => onChange(e.target.value as Crop)}
        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
      >
        {CROPS.map((c) => (
          <MenuItem key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
