import { Button } from "flowbite-react";

export default function CustomAction(props: {
  isVisible: boolean;
  isLoading: boolean;
  text: string;
  icon: JSX.Element;
  onClick: () => void;
  color?: string;
}) {
  return props.isVisible ? (
    <Button
      disabled={props.isLoading}
      size="xs"
      color={props.color}
      onClick={props.onClick}
    >
      {props.icon}
      {props.text}
    </Button>
  ) : (
    <></>
  );
}
