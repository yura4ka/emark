import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

type Props = {
  text: string;
  isVisible: boolean;
  onAccept: () => void;
  onCancel: () => void;
  buttonText?: string;
};

const ConfirmModal = ({
  text,
  isVisible,
  onAccept,
  onCancel,
  buttonText,
}: Props) => {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  return isBrowser ? (
    <Modal show={isVisible} size="md" popup={true} onClose={onCancel}>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Ви впевнені, що хочете {text}?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={onAccept}>
              {buttonText ? buttonText : "Так"}
            </Button>
            <Button color="gray" onClick={onCancel}>
              Скасувати
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  ) : (
    <></>
  );
};

export default ConfirmModal;
