import React from "react";
import UserDetailsForm from "./UserDetailsForm";


const Modal = ({
  id, 
  showModal, 
  showCloseButton, 
  modalTitle,
  modalBody,
  modalFooter,
  setShowModal
}) => {
  const showHideClassName = showModal ? "modal display-flex" : "modal display-none";
  const showCloseButtonClassName = showCloseButton ? "btn-close show" : "btn-close hide"
  const modalTitleClassName = modalTitle ? "modal-title show" : "modal-title hide"; 

  return (
    <div className={showHideClassName} id={id}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className={modalTitleClassName} defaultValue={"modalTitle"}>{modalTitle}</h3>
          <button 
            type="button" 
            className={showCloseButtonClassName}
            onClick={() => setShowModal(false)}
            aria-label="Close"
            aria-controls={id}
          />
        </div>
        <div className="modal-body">{modalBody}</div>
        <div className="modal-footer">{modalFooter}</div>
      </div>
    </div>
  )
}

export default Modal;