import { Label, Select, Spinner } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import React, { useId } from "react";
import type { IRowData } from "./DataTable/types";

interface SelectProps<TData extends IRowData> {
  options: TData[];
  field: Extract<keyof TData, string>;
  label?: string;
  value: TData;
  setValue: (option: TData) => void;
  errorText?: { title: string; text: string };
  isLoading?: boolean;
  showBlank?: boolean;
  isVisible?: boolean;
}

export function MySelect<TData extends IRowData>({
  options,
  field,
  value,
  setValue,
  label = "",
  errorText,
  isLoading,
  showBlank,
  isVisible,
}: SelectProps<TData>) {
  const id = useId();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.selectedIndex;
    const newValue = options[index - Number(showBlank)];
    setValue(newValue ? newValue : { ...value, id: -1, [field]: e.target.value });
  };

  const select = (
    <Select
      id={label + id}
      required={true}
      value={String(value[field])}
      onChange={handleSelect}
    >
      {showBlank && <option itemID="-2">{""}</option>}
      {options.map((o) => (
        <option key={o.id} itemID={o.id.toString()}>
          {o[field]}
        </option>
      ))}
    </Select>
  );

  const error = errorText && (
    <div
      className="mb-4 flex rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-gray-800 dark:text-yellow-300"
      role="alert"
    >
      <HiExclamation className="mr-3 inline h-5 w-5 flex-shrink-0" />
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">{errorText.title}</span> {errorText.text}
      </div>
    </div>
  );

  const classes = ["transition-opacity", "duration-300"];
  if (isVisible === false) classes.push("opacity-0");

  return (
    <div className={classes.join(" ")}>
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={label + id} value={label} />
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {options.length > 0 && select}
          {options.length === 0 && error}
        </>
      )}
    </div>
  );
}
