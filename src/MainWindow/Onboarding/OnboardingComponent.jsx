import Modal from "../../common/components/Modal";
import Button from "../../common/components/Button";
import UserDetailsForm from "../../common/components/UserDetailsForm";
import firstTimer1 from "../../assets/first-timer-1.svg";
import firstTimer2 from "../../assets/first-timer-2.svg";
import firstTimer3 from "../../assets/first-timer-3.svg";
import firstTimer1Circle from "../../assets/first-timer-1-circles.svg";
import firstTimer2Circle from "../../assets/first-timer-2-circles.svg";
import firstTimer3Circle from "../../assets/first-timer-3-circles.svg";
import firstTimer4Circle from "../../assets/first-timer-4-circles.svg";
import arrowRight from "../../assets/arrow-right.png";
import { useState } from "react";

const OnboardingComponent = ({
  handleSetUserData,
  setName,
  setEmail,
  userInputErrorMessage,
  setUserInputErrorMessage,
  name, 
  email
}) => {
  const [step, setStep] = useState(1);

  const handleOnBackClick = () => {
    setStep(step - 1);
  };

  const handleOnNextClick = () => {
    setStep(step + 1);
    resetFormInputs();
  };

  const resetFormInputs = () => {
    if (userInputErrorMessage) {
      setUserInputErrorMessage(null);
    }

    if (name) {
      setName("");
    }

    if (email) {
      setEmail("")
    }
  }

  const backButton = (
    <Button
      type="secondary"
      className="secondary modal-half-button modal-left-button"
      onClick={handleOnBackClick}
    >
      Back
    </Button>
  );
  const nextButton = (
    <Button
      type="primary"
      className="modal-half-button modal-right-button"
      onClick={handleOnNextClick}
    >
      Next
    </Button>
  );

  switch (step) {
    case 1: {
      return (
        <Modal
          show={true}
          isTopTitle={false}
          showCloseButton={false}
          modalTitle={"Hi there!"}
          modalBody={<img className="modal-img" src={firstTimer1}></img>}
          modalDesc={
            "Making your website accessible is within reach. Let’s get started by taking a quick look at how Purple HATS work."
          }
          pageIndicator={
              <img className="page-indicator" src={firstTimer1Circle} ></img>
          }
          modalFooter={
            <Button
              type="primary"
              className="modal-full-button"
              onClick={handleOnNextClick}
            >
              Let's go &nbsp;
              <img src={arrowRight}></img>
            </Button>
          }
          key={step}
        />
      );
    }
    case 2: {
      return (
        <Modal
          show={true}
          isTopTitle={false}
          showCloseButton={false}
          modalTitle={"Get Started"}
          modalBody={
            <div id="first-timer-2-container">
              <div className="typewriter">https://www.</div>
              <img className="modal-img" src={firstTimer2}></img>
            </div>
          }
          modalDesc={
            "You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues."
          }
          pageIndicator={
              <img className="page-indicator" src={firstTimer2Circle} ></img>
          }
          modalFooter={
            <>
              {backButton}
              {nextButton}
            </>
          }
          key={step}
        />
      );
    }
    case 3: {
      return (
        <Modal
          show={true}
          isTopTitle={false}
          showCloseButton={false}
          modalTitle={"Custom Flow"}
          modalBody={<object className="modal-img" data={firstTimer3}></object>}
          modalDesc={
            "Custom flow scan type allows you to specify a user journey of your choice by recording a series of actions on the browser and re-play them automatically."
          }
          pageIndicator={
              <img className="page-indicator" src={firstTimer3Circle} ></img>
          }
          modalFooter={
            <>
              {backButton}
              {nextButton}
            </>
          }
          key={step}
        />
      );
    }
    case 4: {
      const formID = "first-timer-form";
      const policyUrlElem = (
        <a
          href="https://www.tech.gov.sg/privacy/"
          target="_blank"
          rel="noreferrer"
        >
          GovTech's Privacy Policy
        </a>
      );
      const isSubmitDisabled = name.trim() === "" || email.trim() === "";
      return (
        <Modal
          show={true}
          isTopTitle={true}
          showCloseButton={false}
          modalTitle={"Get to know you"}
          modalBody={
            <UserDetailsForm
              formID={formID}
              setName={setName}
              setEmail={setEmail}
              handleSetUserData={handleSetUserData}
              userInputErrorMessage={userInputErrorMessage}
              isSubmitDisabled={isSubmitDisabled}
            ></UserDetailsForm>
          }
          modalDesc={
            <span>
              To personalise your experience, we will be collecting your name,
              email address and app usage data. Your information fully complies
              with {policyUrlElem}
            </span>
          }
          pageIndicator={
              <img className="page-indicator" src={firstTimer4Circle} ></img>
          }
          modalFooter={
            <>
              {backButton}
              <button
                type="submit"
                form={formID}
                className="primary modal-half-button modal-right-button"
                disabled={isSubmitDisabled}
              >
                I consent
              </button>
            </>
          }
          key={step}
        />
      );
    }
    default: {
      return null;
    }
  }
};

export default OnboardingComponent;