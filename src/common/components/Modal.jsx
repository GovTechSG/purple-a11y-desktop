import React from "react";

const Modal = ({
  id, 
  showModal, 
  showHeader,
  isOnboarding,
  modalTitle,
  modalBody,
  modalFooter,
  setShowModal
}) => {
  const modalClassName = getModalClassName(showModal, isOnboarding);
  const modalHeaderClassName = showHeader ? "modal-header show" : "modal-header hide";  
  const modalBodyClassName = isOnboarding ? "modal-body text-center" : "modal-body"; 

  return (
    <div className={modalClassName} id={id} tabIndex={tabIndex}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className={modalHeaderClassName}>
            <h3 className="modal-title" defaultValue={"modalTitle"}>{modalTitle}</h3>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              aria-controls={id}
            />
          </div>
          <div className={modalBodyClassName} tabindex="-1">{modalBody}</div>
          <div className="modal-footer">{modalFooter}</div>
        </div>
      </div>
    </div>
  )
}


const getModalClassName = (showModal, isOnboarding) => {
  let modalClassName; 
  if (showModal) {
    modalClassName = "modal fade show"; 
    if (isOnboarding) {
      modalClassName = "onboarding-modal " + "modal fade show";
    }
  } else {
    modalClassName = "modal d-none"; 
  }
  return modalClassName;
}

export default Modal;