const Modal = ({
    isTopTitle,
    showCloseButton,
    modalTitle, 
    modalBody, 
    modalDesc, 
    modalFooter, 
    animation
}) => {
    return (
        <div className="modal">
            <div className="modal-container">
                {showCloseButton && 
                    <div className="modal-header-button">
                        <button id="close-button">Close</button>
                    </div>
                }
                <div className="modal-content">
                    {isTopTitle && <h3 className="modal-title">{modalTitle}</h3>}
                    {modalBody}
                    {!isTopTitle && <h3 className="modal-title">{modalTitle}</h3>}
                    <p className="modal-desc">{modalDesc}</p>
                    <div className="modal-footer-button">{modalFooter}</div>
                </div>
            </div>
        </div>
    )
}
// className={animation ? "modal-content" : "modal-content" + " " + {animation}}

export default Modal;