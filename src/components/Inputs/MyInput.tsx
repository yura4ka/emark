import React, { useId } from "react";

type Props = {
  value: string;
  setValue: (value: string) => void;
  label: string;
  isValid?: boolean;
  placeholder?: string;
  disabled?: boolean;
  additional?: string;
  hideAdditional?: boolean;
  readonly?: boolean;
};

const MyInput = ({
  value,
  setValue,
  label,
  isValid,
  placeholder,
  disabled,
  additional,
  hideAdditional,
  readonly,
}: Props) => {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={label + id}
        className={`mb-2 block text-sm font-medium text-gray-900 dark:text-white ${
          isValid === false ? "text-red-700 dark:text-red-500" : ""
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={"text"}
          id={label + id}
          placeholder={placeholder}
          disabled={disabled || readonly}
          className={`block w-full rounded-lg border p-2.5 pr-10 text-sm ${
            isValid === false
              ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500"
              : "border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          } ${readonly ? "opacity-50" : ""}`}
        />
      </div>
      {!!additional && !hideAdditional && (
        <p
          className={`mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 ${
            isValid !== false
              ? "text-gray-500 dark:text-gray-400"
              : "text-red-600 dark:text-red-500"
          } ${disabled ? "cursor-default" : ""}`}
        >
          {additional}
        </p>
      )}
    </div>
  );
};

export default MyInput;
