import React, { useEffect, useRef, useState } from "react";

const Modal = ({
  id, 
  key,
  showModal, 
  showHeader,
  keyboardTrap,
  isOnboarding,
  modalTitle,
  modalBody,
  modalFooter,
  setShowModal
}) => {
  const modalClassName = getModalClassName(showModal, isOnboarding);
  const modalHeaderClassName = showHeader ? "modal-header show" : "modal-header hide";  
  const modalBodyClassName = isOnboarding ? "modal-body text-center" : "modal-body"; 

  useEffect(() => {
    const modalBodyElement = document.querySelector('.modal-body');
    if (isOnboarding) {
      modalBodyElement.setAttribute('tabindex', '-1');
    }

    return (() => {
      modalBodyElement.removeAttribute('tabindex');
    })
  }, [isOnboarding])
  
  useEffect(() => {
    if (keyboardTrap) {
      const modalElement = document.querySelector(`#${id}`);
      
      const handleKeyDown = (event) => {
        const focusableElements = modalElement.querySelectorAll('button:not([disabled]), a, input'); 
        const firstFocusableElement = focusableElements[0]; 
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        if (event.key === 'Tab') {
          console.log(event.target);
          if (!modalElement.contains(event.target)) {
            event.preventDefault();
            firstFocusableElement.focus(); 
          } else if (event.shiftKey && event.target === firstFocusableElement) {
            event.preventDefault(); 
            lastFocusableElement.focus();
          } else if (!event.shiftKey && event.target === lastFocusableElement) {
            event.preventDefault();
            firstFocusableElement.focus(); 
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown); 

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
  }, [keyboardTrap])

  return (
    <div className={modalClassName} id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className={modalHeaderClassName}>
            <h3 className="modal-title" defaultValue={"modalTitle"} aria-live="polite">{modalTitle}</h3>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              aria-controls={id}
            />
          </div>
          <div className={modalBodyClassName} key={key}>{modalBody}</div>
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