import { Button } from "flowbite-react";
import type { HandleChangeButtonsProps } from "./types";
import { HiCheck, HiX } from "react-icons/hi";

function HandleChangesButtons({
  isLoading,
  isError,
  handleSave,
  handleCancel,
}: HandleChangeButtonsProps) {
  return (
    <>
      <Button
        onClick={() => handleSave()}
        disabled={isLoading || isError}
        size="xs"
        color="success"
      >
        <HiCheck className="mr-1 h-4 w-4" />
        Зберегти
      </Button>
      <Button
        onClick={() => handleCancel()}
        disabled={isLoading}
        size="xs"
        color="failure"
      >
        <HiX className="mr-1 h-4 w-4" />
        Скасувати
      </Button>
    </>
  );
}

export default HandleChangesButtons;
