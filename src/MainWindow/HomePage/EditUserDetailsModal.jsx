import { useState } from "react";
import { policyUrlElem } from "../../common/constants";
import Modal from "../../common/components/Modal";
import UserDetailsForm from "../../common/components/UserDetailsForm";

const EditUserDetailsModal = ({
  id,
  formID,
  showModal,
  initialName,
  initialEmail,
  setShowEditDataModal,
  setUserData,
}) => {
  const [editedName, setEditedName] = useState(initialName);
  const [editedEmail, setEditedEmail] = useState(initialEmail);
  const [nameInputErrorMessage, setNameInputErrorMessage] = useState(null);
  const [emailInputErrorMessage, setEmailInputErrorMessage] = useState(null);

  const isSubmitDisabled =
    editedName.trim() === "" ||
    editedEmail.trim() === "" ||
    (editedName === initialName && editedEmail === initialEmail) ||
    nameInputErrorMessage ||
    emailInputErrorMessage;

  const handleEditUserData = () => {
    window.services.editUserData({ name: editedName, email: editedEmail });
    setShowEditDataModal(false);
    setUserData((userData) => ({ ...userData, name: editedName, email: editedEmail }))
  };

  const setShowModal = (show) => {
    setEditedEmail(initialEmail);
    setEditedName(initialName);
    setEmailInputErrorMessage(null);
    setNameInputErrorMessage(null);
    setShowEditDataModal(show);
  };

  if (showModal) {
    return (
      <Modal
        id={id}
        showModal={showModal}
        showHeader={true}
        modalTitle={"Edit your profile"}
        modalSizeClass="modal-dialog-centered"
        modalBody={
          <>
            <UserDetailsForm
              formID={formID}
              name={editedName}
              email={editedEmail}
              setName={setEditedName}
              setEmail={setEditedEmail}
              handleOnSubmit={handleEditUserData}
              nameInputErrorMessage={nameInputErrorMessage}
              emailInputErrorMessage={emailInputErrorMessage}
              setNameInputErrorMessage={setNameInputErrorMessage}
              setEmailInputErrorMessage={setEmailInputErrorMessage}
            />
            <p>
              We are collecting your name, email address and app usage data.
              Your information fully complies with {policyUrlElem}.
            </p>
          </>
        }
        modalFooter={
          <button
            type="submit"
            form={formID}
            className={`${isSubmitDisabled ? '' : 'primary'} modal-button`}
            disabled={isSubmitDisabled}
          >
            Update
          </button>
        }
        setShowModal={setShowModal}
      />
    );
  }
};

export default EditUserDetailsModal;
