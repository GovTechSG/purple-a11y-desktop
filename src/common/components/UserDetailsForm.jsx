import services from "../../services";

const UserDetailsForm = ({
  formID,
  name,
  email,
  setName,
  setEmail,
  handleOnSubmit,
  userInputErrorMessage,
  setUserInputErrorMessage,
  isOnboarding,
}) => {
  const userFormClassName = isOnboarding ? "user-form fade-in" : "user-form";
  const emailInput = document.querySelector("#email");

  const onHandleEmailChange = (e) => {
    setEmail(e.target.value);
    if (userInputErrorMessage) {
      setUserInputErrorMessage(null);
      emailInput.removeAttribute("aria-invalid");
    }
  };

  const onHandleEmailBlur = (e) => {
    if (!services.isValidEmail(e.target.value)) {
      setUserInputErrorMessage("Please enter a valid email.");
      emailInput.setAttribute("aria-invalid", "true");
      return;
    }
  };

  return (
    <div className={userFormClassName}>
      <form id={formID} onSubmit={(e) => handleOnSubmit(e)}>
        <div className="user-form-field">
          <label className="user-form-label" for="name">
            Name
          </label>
          <input
            className="user-form-input"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
        </div>
        <div className="user-form-field">
          <label className="user-form-label" for="email">
            Work Email
          </label>
          <input
            className="user-form-input"
            type="text"
            id="email"
            value={email}
            onChange={(e) => onHandleEmailChange(e)}
            onBlur={(e) => onHandleEmailBlur(e)}
            aria-describedby="invalid-email-error"
          ></input>
        </div>
        <div className="user-form-error error-text" id="invalid-email-error">
          {userInputErrorMessage}
        </div>
      </form>
    </div>
  );
};

export default UserDetailsForm;
