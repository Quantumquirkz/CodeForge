import type { ReactNode } from "react";

type Option = {
  value: string;
  label: string;
};

type SelectControlProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  adornment?: ReactNode;
};

export function SelectControl({ label, value, options, onChange, adornment }: SelectControlProps) {
  return (
    <label className="select-control">
      <span className="select-control__label">{label}</span>
      <span className="select-control__field">
        {adornment ? <span className="select-control__adornment">{adornment}</span> : null}
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
