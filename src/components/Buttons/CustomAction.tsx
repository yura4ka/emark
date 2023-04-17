import { Button } from "flowbite-react";
import type { CustomActionProps } from "../DataTable/types";

export default function CustomAction(props: CustomActionProps) {
  const Icon = props.icon;

  return props.isVisible ? (
    <Button
      disabled={props.isLoading}
      size="xs"
      color={props.color}
      onClick={props.onClick}
      className="shrink-0"
    >
      <Icon className="mr-1 h-4 w-4" />
      {props.text}
    </Button>
  ) : (
    <></>
  );
}
