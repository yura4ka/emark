import { Tooltip } from "flowbite-react";
import { type ComponentProps, type FC, useEffect, useState } from "react";

interface Props {
  tooltip: string;
  icon: FC<ComponentProps<"svg">>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function IconButton({ tooltip, icon: Icon, onClick, className }: Props) {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  const btn = (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 ${
        className || ""
      }`}
    >
      <Icon className="h-full w-full" />
    </button>
  );

  return isBrowser ? (
    <Tooltip content={tooltip} placement="bottom">
      {btn}
    </Tooltip>
  ) : (
    <>{btn}</>
  );
}
