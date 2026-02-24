import type { ChangeEvent } from "react";
import { useState } from "react";

interface SelectComponentProps {
  options: string[];
  inputId: string;
  labelText: string;
  changeCallback: (value: string) => void;
}

export default function SelectComponent({
  options,
  inputId,
  labelText,
  changeCallback,
}: SelectComponentProps) {
  const [selected, setSelected] = useState("");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelected(event.target.value);
    changeCallback(event.target.value);
  };

  return (
    <div>
      <label htmlFor={inputId}>{labelText}</label>
      <select id={inputId} value={selected} onChange={handleChange}>
        <option value="" disabled />
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
