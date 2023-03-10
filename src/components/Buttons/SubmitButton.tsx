import { Button, Spinner } from "flowbite-react";
import React from "react";

type Props = {
  text: string;
  disabled?: boolean;
  isLoading?: boolean;
};

const SubmitButton = ({ text, disabled, isLoading }: Props) => {
  return (
    <Button
      type="submit"
      className={`mt-1 w-full ${disabled ? "cursor-default" : ""}`}
      disabled={disabled || isLoading}
    >
      <Spinner
        aria-label="Loader indictor"
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-1" : "opacity-0"
        }`}
      />
      <span
        className={`transition-all duration-300 ${
          isLoading ? "ml-3" : "-ml-3"
        }`}
      >
        {text}
      </span>
    </Button>
  );
};

export default SubmitButton;
