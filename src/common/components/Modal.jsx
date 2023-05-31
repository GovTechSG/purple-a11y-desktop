import React from "react";

export const Modal = ({
  id,
  modalTitle,
  show,
  setShowModal,
  modalBody,
  modalFooter,
}) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";
  return (
    <div id={id} className={showHideClassName}>
      <div className="modal-content" id="modal-content">
        <div className="modal-header">
          <h3>{modalTitle}</h3>
          <button
            className="close button transparent"
            onClick={() => setShowModal(false)}
            aria-label="Close"
            aria-controls={id}
          >
            <i aria-hidden="true" className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-body">{modalBody}</div>
        <div className="modal-footer">{modalFooter}</div>
      </div>
    </div>
  );
};
