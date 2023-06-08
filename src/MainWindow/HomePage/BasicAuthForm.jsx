import React from "react";

export const BasicAuthForm = ({ handleBasicAuthSubmit }) => {
  return (
    <form
      id="home-page-basic-auth-form"
      onSubmit={(e) => handleBasicAuthSubmit(e)}
    >
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
      </div>
    </form>
  );
};

export const BasicAuthFormFooter = ({ setShowBasicAuthModal }) => {
  return (
    <>
      <button
        className="button secondary"
        aria-controls="basic-auth-modal"
        onClick={() => setShowBasicAuthModal(false)}
      >
        Close
      </button>
      <button
        form="home-page-basic-auth-form"
        className="button primary"
        type="submit"
      >
        Scan
      </button>
    </>
  );
};
