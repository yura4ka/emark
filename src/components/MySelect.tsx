import { Label, Select, Spinner } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import React, { useId } from "react";

type TOption = {
  id: number;
  value: string;
};

interface SelectProps {
  options: { id: number; name?: string; title?: string }[];
  label: string;
  value: TOption;
  setValue: (option: TOption) => void;
  errorText?: { title: string; text: string };
  isLoading?: boolean;
  showBlank?: boolean;
  isVisible?: boolean;
}

const MySelect = ({
  options,
  value,
  setValue,
  label,
  errorText,
  isLoading,
  showBlank,
  isVisible,
}: SelectProps) => {
  const id = useId();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.selectedIndex;
    const el = e.target.children[index];
    setValue({
      id: +(el?.getAttribute("itemid") || -1),
      value: e.target.value,
    });
  };

  const select = (
    <Select
      id={label + id}
      required={true}
      value={value.value}
      onChange={handleSelect}
    >
      {showBlank && <option itemID="-1">{""}</option>}
      {options.map((o) => (
        <option key={o.id} itemID={o.id.toString()}>
          {o.name || o.title}
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
      <div className="mb-2 block">
        <Label htmlFor={label + id} value={label} />
      </div>
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
};

export default MySelect;
