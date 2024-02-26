import services from "../../services";

const UserDetailsForm = ({
  formID,
  name,
  email,
  setName,
  setEmail,
  handleOnSubmit,
  nameInputErrorMessage,
  emailInputErrorMessage,
  setNameInputErrorMessage,
  setEmailInputErrorMessage,
  isOnboarding,
}) => {
  const userFormClassName = isOnboarding
    ? "user-form fade-in-left"
    : "user-form";

  const validateName = () => {
    if (!services.isValidName(name)) {
      setNameInputErrorMessage(
        "Only printable characters excluding <>'\"\\/;|&!$*{}()[\\]\\r\\n\\$ are allowed"
      );
      return false;
    }

    return true;
  };

  const validateEmail = () => {
    if (!services.isValidEmail(email)) {
      setEmailInputErrorMessage("Invalid email address.");
      return false;
    }

    return true;
  };

  const onHandleNameChange = (e) => {
    setNameInputErrorMessage(null);
    setName(e.target.value);
  };

  const onHandleEmailChange = (e) => {
    setEmailInputErrorMessage(null);
    setEmail(e.target.value);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const validated = validateName() && validateEmail();

    if (!validated) return;

    handleOnSubmit();
  };

  return (
    <div className={userFormClassName}>
      <form id={formID} onSubmit={onSubmitHandler}>
        <div className="user-form-field">
          <label className="user-form-label" for="name">
            Name
          </label>
          <input
            className="user-form-input"
            type="text"
            id="name"
            value={name}
            onChange={onHandleNameChange}
            onBlur={validateName}
            aria-describedby="invalid-name-error"
            aria-invalid={!!nameInputErrorMessage}
          ></input>
        </div>
        <div className="user-form-error error-text" id="invalid-name-error">
          {nameInputErrorMessage}
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
            onChange={onHandleEmailChange}
            onBlur={validateEmail}
            aria-describedby="invalid-email-error"
            aria-invalid={!!emailInputErrorMessage}
          ></input>
        </div>
        <div className="user-form-error error-text" id="invalid-email-error">
          {emailInputErrorMessage}
        </div>
      </form>
    </div>
  );
};

export default UserDetailsForm;
