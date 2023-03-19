import { Tooltip } from "flowbite-react";
import type { ComponentProps, FC } from "react";

interface Props {
  tooltip: string;
  icon: FC<ComponentProps<"svg">>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

function IconButton({ tooltip, icon: Icon, onClick, className }: Props) {
  return (
    <Tooltip content={tooltip} placement="bottom">
      <button
        type="button"
        onClick={onClick}
        className={`flex h-8 w-8 p-1 hover:bg-gray-200 ${className || ""}`}
      >
        <Icon className="h-full w-full" />
      </button>
    </Tooltip>
  );
}

export default IconButton;
