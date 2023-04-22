import type { FC, InputHTMLAttributes } from "react";
import { useId } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
  setValue: (value: number) => void;
  isError?: boolean;
  errorText?: string;
}

export const NumberInput: FC<Props> = ({
  label,
  value,
  setValue,
  isError,
  errorText,
  ...props
}) => {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={`${id}number-input`}
        className={`mb-2 block text-sm font-medium ${
          isError ? "text-red-700 dark:text-red-500" : "text-gray-900 dark:text-white"
        }`}
      >
        {label}
      </label>

      <input
        type={"number"}
        value={value}
        onChange={(e) => setValue(e.target.valueAsNumber)}
        id={`${id}number-input`}
        className={`block w-full rounded-lg border p-2.5 text-sm ${
          isError
            ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500"
            : "border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        }`}
        {...props}
      />
      <p
        className={`mt-2 text-sm font-medium text-red-600 transition-opacity duration-200 dark:text-red-500 ${
          isError ? "opacity-100" : "select-none opacity-0"
        }`}
      >
        {errorText}
      </p>
    </div>
  );
};
