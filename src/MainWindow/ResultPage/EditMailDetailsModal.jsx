import { useState } from "react";
import Modal from "../../common/components/Modal";
import services from "../../services";

const EditMailDetailsModal = ({
  showModal,
  onUpdateShowModal,
  onSubmitMail,
  initialEmail,
  initialSubject,
}) => {
  const [editedEmail, setEditedEmail] = useState(initialEmail);
  const [editedSubject, setEditedSubject] = useState(initialSubject);
  const [userInputErrorMessage, setUserInputErrorMessage] = useState(null);

  const isSubmitDisabled =
    editedSubject.trim() === "" ||
    editedEmail.trim() === "" ||
    userInputErrorMessage;

  const setShowModal = (show) => {
    setEditedEmail(initialEmail);
    setEditedSubject(initialSubject);
    setUserInputErrorMessage(null);
    onUpdateShowModal(show);
  };

  const emailInput = document.querySelector("#email");

  const onHandleEmailChange = (e) => {
    setEditedEmail(e.target.value);
    if (userInputErrorMessage) {
      setUserInputErrorMessage(null);
      emailInput.removeAttribute("aria-invalid");
    }
  };

  const onHandleEmailBlur = (e) => {
    const containsInvalidEmail = e.target.value
      .split(",")
      .map((e) => services.isValidEmail(e.trim()))
      .some((v) => !v);
    if (containsInvalidEmail) {
      setUserInputErrorMessage(
        "Please enter valid email(s) separated by commas"
      );
      emailInput.setAttribute("aria-invalid", "true");
      return;
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    onSubmitMail(editedEmail, editedSubject);

    setShowModal(false);
  };

  return (
    <Modal
      id="edit-mail-details-modal"
      showModal={showModal}
      showHeader={true}
      keyboardTrap={showModal}
      modalTitle="Mail Details"
      modalSizeClass="modal-lg"
      modalBody={
        <div className="user-form">
          <form id="edit-mail-details-form" onSubmit={onSubmit}>
            <div className="user-form-field">
              <label className="user-form-label" for="email">
                Email(s)
              </label>
              <input
                className="user-form-input"
                type="text"
                id="email"
                value={editedEmail}
                onChange={(e) => onHandleEmailChange(e)}
                onBlur={(e) => onHandleEmailBlur(e)}
                aria-describedby="invalid-email-error"
              />
            </div>
            <div
              className="user-form-error error-text"
              id="invalid-email-error"
            >
              {userInputErrorMessage}
            </div>
            <div className="user-form-field">
              <label className="user-form-label" for="subject">
                Subject
              </label>
              <input
                className="user-form-input"
                type="text"
                id="subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
              />
            </div>
          </form>
        </div>
      }
      modalFooter={
        <button
          type="submit"
          form="edit-mail-details-form"
          className={`${isSubmitDisabled ? '' : 'primary'} modal-button`}
          disabled={isSubmitDisabled}
        >
          Send Mail
        </button>
      }
      setShowModal={setShowModal}
    />
  );
};

export default EditMailDetailsModal;
