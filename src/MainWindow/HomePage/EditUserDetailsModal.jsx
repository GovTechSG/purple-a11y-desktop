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
}) => {
  const [editedName, setEditedName] = useState(initialName);
  const [editedEmail, setEditedEmail] = useState(initialEmail);
  const [userInputErrorMessage, setUserInputErrorMessage] = useState(null);

  const isSubmitDisabled =
    editedName.trim() === "" ||
    editedEmail.trim() === "" ||
    (editedName === initialName && editedEmail === initialEmail) ||
    userInputErrorMessage;

  const handleEditUserData = (e) => {
    e.preventDefault();

    window.services.editUserData({ name: editedName, email: editedEmail });
    setShowEditDataModal(false);
  };

  const setShowModal = (show) => {
    setEditedEmail(initialEmail);
    setEditedName(initialName);
    setUserInputErrorMessage(null);
    setShowEditDataModal(show);
  };

  if (showModal) {
    return (
      <Modal
        id={id}
        showModal={showModal}
        showHeader={true}
        keyboardTrap={showModal}
        modalTitle={"Edit your profile"}
        modalBody={
          <>
            <UserDetailsForm
              formID={formID}
              name={editedName}
              email={editedEmail}
              setName={setEditedName}
              setEmail={setEditedEmail}
              handleOnSubmit={handleEditUserData}
              userInputErrorMessage={userInputErrorMessage}
              setUserInputErrorMessage={setUserInputErrorMessage}
              isSubmitDisabled={isSubmitDisabled}
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
            className="primary modal-button"
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
