import { useState } from "react";

export function useModal() {
  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  const setModalVisibility = (isVisible: boolean) =>
    setModalData((data) => ({ ...data, isVisible }));

  const modalProps = {
    text: modalData.text,
    isVisible: modalData.isVisible,
    onAccept: modalData.onAccept,
    onCancel: () => setModalVisibility(false),
    buttonText: "Підтвердити",
  };

  return { modalData, setModalData, setModalVisibility, modalProps };
}
