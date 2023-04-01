import { Tooltip } from "flowbite-react";
import { type ComponentProps, type FC, useEffect, useState } from "react";

interface Props {
  tooltip: string;
  icon: FC<ComponentProps<"svg">>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

function IconButton({ tooltip, icon: Icon, onClick, className }: Props) {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  return isBrowser ? (
    <Tooltip content={tooltip} placement="bottom">
      <button
        type="button"
        onClick={onClick}
        className={`flex h-8 w-8 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 ${
          className || ""
        }`}
      >
        <Icon className="h-full w-full" />
      </button>
    </Tooltip>
  ) : (
    <></>
  );
}

export default IconButton;
