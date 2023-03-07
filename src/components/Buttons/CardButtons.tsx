import { Button } from "flowbite-react";

export default function CardButtons(props: {
  isLoading: boolean;
  isError: boolean;
  isDisabled: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
}) {
  return (
    <>
      <div className="flex gap-1">
        <Button
          className="mt-2"
          color={"success"}
          disabled={props.isLoading || props.isError || props.isDisabled}
          onClick={props.onConfirm}
        >
          Зберегти
        </Button>
        <Button className="mt-2" color={"failure"} onClick={props.onDiscard}>
          Скасувати зміни
        </Button>
      </div>

      {props.isError && (
        <p className="text-sm text-red-600 dark:text-red-500">
          У вибраному факультеті вже є група з такою назвою!
        </p>
      )}
    </>
  );
}
