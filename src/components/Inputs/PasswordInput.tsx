import React, { useId, useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

export type TPasswordConfirm = {
  value: string;
  confirm: string;
  isCorrect: boolean;
};

type Props = {
  input: TPasswordConfirm;
  setValue: (value: TPasswordConfirm) => void;
  label: string;
  type: "value" | "confirm";
  disabled?: boolean;
  additionalText?: string;
  validationFunction?: (value: string, confirm: string) => boolean;
};

export const PasswordInput = ({
  input,
  setValue,
  label,
  type,
  disabled,
  additionalText,
  validationFunction,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  validationFunction ??= () => true;
  const isValid =
    (type === "confirm" && input.isCorrect) ||
    (type === "value" && validationFunction(input.value, input.confirm));

  const checkValid = (value: string) => {
    const field = type === "value" ? "confirm" : "value";
    return value.length === 0 || input[field]?.length === 0 || input[field] === value;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let isCorrect: boolean;
    if (type === "confirm" && value.length < input.value.length) isCorrect = true;
    else isCorrect = checkValid(value);
    setValue({ ...input, [type]: value, isCorrect });
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isCorrect = checkValid(value);
    setValue({ ...input, isCorrect });
  };

  const svgStyle = `${
    isValid === false
      ? "text-red-400 dark:text-red-500"
      : "text-gray-300 dark:text-gray-500"
  }`;

  const AdditionalInfo = ({ text }: { text: string }) => (
    <p
      className={`mt-2 text-sm font-medium ${
        isValid ? "text-gray-500 dark:text-gray-400" : "text-red-600 dark:text-red-500"
      } ${disabled ? "cursor-default" : ""}`}
    >
      {text}
    </p>
  );

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
        <div
          onClick={() => setShowPassword((p) => !p)}
          className={`absolute inset-y-0 right-0 flex cursor-pointer items-center px-3`}
        >
          {showPassword ? (
            <HiEye className={svgStyle} />
          ) : (
            <HiEyeOff className={svgStyle} />
          )}
        </div>
        <input
          value={input[type]}
          onChange={onChange}
          onBlur={onBlur}
          type={showPassword ? "text" : "password"}
          id={label + id}
          placeholder={showPassword ? "password" : "•••••••••"}
          disabled={disabled}
          className={`block w-full rounded-lg border p-2.5 pr-10 text-sm ${
            isValid === false
              ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500"
              : "border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          }`}
        />
      </div>
      {!!additionalText && <AdditionalInfo text={additionalText} />}
    </div>
  );
};
