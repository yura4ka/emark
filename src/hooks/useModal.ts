import { useState } from "react";

export function useModal() {
  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  const setModalVisibility = (isVisible: boolean) =>
    setModalData((data) => ({ ...data, isVisible }));

  return { modalData, setModalData, setModalVisibility };
}
