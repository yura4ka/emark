import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  buttonText: string;
  isVisible: boolean;
  onClose: () => unknown;
  Icon: JSX.Element;
  color: "success" | "failure" | "warning";
};

export const PopupModal = ({
  text,
  buttonText,
  isVisible,
  onClose,
  Icon,
  color,
}: Props) => {
  let textColor = "";
  switch (color) {
    case "success":
      textColor = "text-green-700 dark:[&_svg]:text-green-500";
      break;
    case "failure":
      textColor = "text-red-700 dark:[&_svg]:text-red-600";
      break;
    case "warning":
      textColor = "text-yellow-400";
      break;
  }

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  if (!isBrowser) return null;

  return (
    <Modal show={isVisible} size="md" popup={true} onClose={onClose}>
      <Modal.Header />
      <Modal.Body>
        <div className="flex flex-col gap-7 text-center">
          <div className={`[&_svg]:mx-auto [&_svg]:h-14 [&_svg]:w-14 ${textColor}`}>
            {Icon}
          </div>
          <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">{text}</h3>
          <div className="flex justify-center gap-4">
            <Button color={color} onClick={onClose} className="w-4/6">
              {buttonText}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
