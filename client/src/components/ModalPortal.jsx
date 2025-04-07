import { createPortal } from "react-dom";

const ModalPortal = ({ children }) => {
  const modalRoot = document.getElementById("modal-root");
  return createPortal(children, modalRoot);
};

export default ModalPortal;
