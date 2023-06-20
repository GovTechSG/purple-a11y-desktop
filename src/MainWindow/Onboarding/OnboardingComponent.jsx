import Modal from "../../common/components/Modal";
import Button from "../../common/components/Button";
import UserDetailsForm from "../../common/components/UserDetailsForm";
import PageIndicator from "./components/PageIndicator";
import { policyUrlElem } from "../../common/constants";
import firstTimer1 from "../../assets/first-timer-1.svg";
import firstTimer2 from "../../assets/first-timer-2.svg";
import firstTimer3 from "../../assets/first-timer-3.svg";
import arrowRight from "../../assets/arrow-right.png";
import { useEffect, useState } from "react";

const OnboardingComponent = ({
  handleSetUserData,
  setName,
  setEmail,
  userInputErrorMessage,
  setUserInputErrorMessage,
  name, 
  email
}) => {
  const [step, setStep] = useState(0);

  const showSlide = (step) => {
    const carouselBody = document.querySelector('.carousel-body'); 
    const carouselBodyItems = carouselBody.querySelectorAll('.carousel-body-item'); 
    const carouselFooter = document.querySelector('.carousel-footer');
    const carouselFooterItems = carouselFooter.querySelectorAll('.carousel-footer-item');

    console.log(carouselBody)
    console.log(step);
    // carouselBody.animate({
    //   scrollLeft: carouselBody.offsetWidth 
    // })
    carouselBody.scrollBy(carouselBody.offsetWidth * 2, 0);

    carouselBodyItems[step].scrollIntoView(true);

    carouselFooterItems.forEach((item, index) => {
      if (index == step) {
        carouselFooter.animate({
          scrollLeft: (carouselFooter.offsetWidth / 4) * step
        })
      }
    })

    // carouselBodyItems[step].focus(); 
    // carouselFooterItems[step].focus();
  }

  const handleOnBackClick = () => {
    setStep(step - 1);
    showSlide(step - 1);
  };

  const handleOnNextClick = () => {
    setStep(step + 1);
    resetFormInputs();
    showSlide(step + 1);
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

  const formID = "first-timer-form";
  const isSubmitDisabled = name.trim() === "" || email.trim() === "";

  const backButton = (
    <Button
      type="secondary"
      className="secondary modal-button modal-half-button modal-left-button"
      onClick={handleOnBackClick}
    >
      Back
    </Button>
  );
  const nextButton = (
    <Button
      type="primary"
      className="modal-button modal-half-button modal-right-button"
      onClick={handleOnNextClick}
    >
      Next
    </Button>
  );
  
  const onboardingCarouselBody = (
    <div>
      <ul className="onboarding-carousel carousel-body">
        <li className="onboarding-carousel-item carousel-body-item">
          <div className="modal-img-container fade-in" aria-hidden="true">
            <img className="modal-img" src={firstTimer1}></img>
          </div>
          <h3 className="modal-title fade-in">Hi There!</h3>
          <p className="modal-desc fade-in">Making your website accessible is within reach. Let’s get started by taking a quick look at how Purple HATS work.</p>
          <PageIndicator page={1}></PageIndicator>
        </li>
        <li className="onboarding-carousel-item carousel-body-item">
          <div className="modal-img-container fade-in" aria-hidden="true">
            <div id="first-timer-2-container">
              <div className="typewriter">https://www.</div>
              <img className="modal-img" src={firstTimer2}></img>
            </div>
          </div>
          <h3 className="modal-title fade-in">Get started</h3>
          <p className="modal-desc fade-in">You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues.</p>
          <PageIndicator page={2}></PageIndicator>
        </li>
        <li className="onboarding-carousel-item carousel-body-item">
          <div className="modal-img-container fade-in" aria-hidden="true">
            <img className="modal-img" src={firstTimer3}></img>
          </div>
          <h3 className="modal-title fade-in">Custom Flow</h3>
          <p className="modal-desc fade-in">You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues.</p>
          <PageIndicator page={3}></PageIndicator>
        </li>
        <li className="onboarding-carousel-item carousel-body-item">
          <h3 className="modal-title fade-in">Get to know you</h3>
          <UserDetailsForm
            formID={formID}
            setName={setName}
            setEmail={setEmail}
            handleOnSubmit={handleSetUserData}
            userInputErrorMessage={userInputErrorMessage}
            isOnboarding={true}
          />
          <p className="modal-desc fade-in">
            To personalise your experience, we will be collecting your name, email address and app usage data. Your information fully complies with {policyUrlElem}
          </p>
          <PageIndicator page={4}></PageIndicator>
        </li>
      </ul>
    </div>
  )

  const onboardingCarouselFooter = (
    <>
      <ul className="onboarding-carousel carousel-footer">
        <li className="onboarding-carousel-item carousel-footer-item">
          <Button
            type="primary"
            className="modal-button modal-full-button"
            onClick={handleOnNextClick}
          >
            Let's go &nbsp;
            <img src={arrowRight}></img>
          </Button>
        </li>
        <li className="onboarding-carousel-item carousel-footer-item">
          {backButton}
          {nextButton}
        </li>
        <li className="onboarding-carousel-item carousel-footer-item">
          {backButton}
          <button
            type="submit"
            form={formID}
            className="primary modal-button modal-half-button modal-right-button"
            disabled={isSubmitDisabled}
          >
            I consent
          </button>
        </li>
      </ul>
    </>
  )

  return (
    <Modal 
      showModal={true}
      showHeader={false}
      isOnboarding={true}
      modalBody={onboardingCarouselBody}
      modalFooter={onboardingCarouselFooter}
      key={step}
    />
  )
  // switch (step) {
  //   case 1: {
  //     return (
  //       <Modal
  //         showModal={true}
  //         showHeader={false}
  //         isOnboarding={true}
  //         modalBody={
  //           <>
  //             <div className="modal-img-container fade-in" aria-hidden="true">
  //               <img className="modal-img" src={firstTimer1}></img>
  //             </div>
  //             <h3 className="modal-title fade-in">Hi There!</h3>
  //             <p className="modal-desc fade-in">Making your website accessible is within reach. Let’s get started by taking a quick look at how Purple HATS work.</p>
  //             <PageIndicator page={1}></PageIndicator>
  //           </>
  //         }
  //         modalFooter={
  //           <Button
  //             type="primary"
  //             className="modal-button modal-full-button"
  //             onClick={handleOnNextClick}
  //           >
  //             Let's go &nbsp;
  //             <img src={arrowRight}></img>
  //           </Button>
  //         }
  //         key={step}
  //       />
  //     );
  //   }
  //   case 2: {
  //     return (
  //       <Modal
  //         showModal={true}
  //         showHeader={false}
  //         isOnboarding={true}
  //         modalBody={
  //           <>
  //             <div className="modal-img-container fade-in" aria-hidden="true">
  //               <div id="first-timer-2-container">
  //                 <div className="typewriter">https://www.</div>
  //                 <img className="modal-img" src={firstTimer2}></img>
  //               </div>
  //             </div>
  //             <h3 className="modal-title fade-in">Get started</h3>
  //             <p className="modal-desc fade-in">You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues.</p>
  //             <PageIndicator page={2}></PageIndicator>
  //           </>
  //         }
  //         modalFooter={
  //           <>
  //             {backButton}
  //             {nextButton}
  //           </>
  //         }
  //         key={step}
  //       />
  //     );
  //   }
  //   case 3: {
  //     return (
  //       <Modal
  //         showModal={true}
  //         showHeader={false}
  //         isOnboarding={true}
  //         modalBody={
  //           <>
  //             <div className="modal-img-container fade-in" aria-hidden="true">
  //               <img className="modal-img" src={firstTimer3}></img>
  //             </div>
  //             <h3 className="modal-title fade-in">Custom Flow</h3>
  //             <p className="modal-desc fade-in">You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues.</p>
  //             <PageIndicator page={3}></PageIndicator>
  //           </>
  //         }
  //         modalFooter={
  //           <>
  //             {backButton}
  //             {nextButton}
  //           </>
  //         }
  //         key={step}
  //       />
  //     );
  //   }
  //   case 4: {
  //     const formID = "first-timer-form";
  //     const isSubmitDisabled = name.trim() === "" || email.trim() === "";
      
  //     return (
  //       <Modal
  //         showModal={true}
  //         showHeader={false}
  //         isOnboarding={true}
  //         modalBody={
  //           <>
  //             <h3 className="modal-title fade-in">Get to know you</h3>
  //             <UserDetailsForm
  //               formID={formID}
  //               setName={setName}
  //               setEmail={setEmail}
  //               handleOnSubmit={handleSetUserData}
  //               userInputErrorMessage={userInputErrorMessage}
  //               isOnboarding={true}
  //             />
  //             <p className="modal-desc fade-in">
  //               To personalise your experience, we will be collecting your name, email address and app usage data. Your information fully complies with {policyUrlElem}
  //             </p>
  //             <PageIndicator page={4}></PageIndicator>
  //           </>
  //         }
  //         modalFooter={
  //           <>
  //             {backButton}
  //             <button
  //               type="submit"
  //               form={formID}
  //               className="primary modal-button modal-half-button modal-right-button"
  //               disabled={isSubmitDisabled}
  //             >
  //               I consent
  //             </button>
  //           </>
  //         }
  //         key={step}
  //       />
  //     );
  //   }
  //   default: {
  //     return null;
  //   }
  // }
};

export default OnboardingComponent;