import Modal from "../../common/components/Modal"; 
import Button from "../../common/components/Button";
import UserDetailsForm from "../../common/components/UserDetailsForm"
import firstTimer1 from "../../assets/first-timer-1.svg";
import firstTimer2 from "../../assets/first-timer-2.svg";
import firstTimer3 from "../../assets/first-timer-3.svg";
import { useState } from "react";

const OnboardingComponent = ({
    handleSetUserData,
    setName, 
    setEmail,
    userInputErrorMessage
}) => {
    const [step, setStep] = useState(1);
    const [animation, setAnimation] = useState("in");

    const handleOnBackClick = () => {
        setAnimation("out");
        setStep(step - 1);
        setAnimation("in");
    }

    const handleOnNextClick = () => {
        setAnimation("out");
        setStep(step + 1);
        setAnimation("in");
    }

    const backButton = <Button type="secondary" className="secondary modal-half-button modal-left-button" onClick={handleOnBackClick}>Back</Button>; 
    const nextButton = <Button type="primary" className="modal-half-button modal-right-button" onClick={handleOnNextClick}>Next</Button>; 

    switch(step) {
        case 1: {
            return (
                <Modal 
                    isTopTitle={false}
                    showCloseButton={false}
                    modalTitle={"Hi there!"}
                    modalBody={
                        <img className="modal-img" src={firstTimer1} ></img>
                    }
                    modalDesc={"Making your website accessible is within reach. Let’s get started by taking a quick look at how Purple HATS work."}
                    modalFooter={
                        <Button type="primary" className="modal-full-button" onClick={handleOnNextClick}>Let's go</Button>
                    }
                    key={step}
                    animation={animation}
                />
            )
        }
        case 2: {
            return (
                <Modal 
                    isTopTitle={false}
                    showCloseButton={false}
                    modalTitle={"Get Started"}
                    modalBody={
                        <img className="modal-img" src={firstTimer2} ></img>
                    }
                    modalDesc={"You just need to enter your website/sitemap URL and Purple HATS will crawl through all the web pages to analyse for accessibility issues."}
                    modalFooter={
                        <>
                           {backButton}
                           {nextButton}
                        </>
                    }
                    key={step}
                    animation={animation}
                />
            )
        }
        case 3: {
            return (
                <Modal 
                    isTopTitle={false}
                    showCloseButton={false}
                    modalTitle={"Custom Flow"}
                    modalBody={
                        <img className="modal-img" src={firstTimer3} ></img>
                    }
                    modalDesc={"Custom flow scan type allows you to specify a user journey of your choice by recording a series of actions on the browser and re-play them automatically."}
                    modalFooter={
                        <>
                            {backButton}
                            {nextButton}
                        </>
                    }
                    key={step}
                />
            )
        }
        case 4: {
            const formID = "first-timer-form";
            const policyUrlElem = (<a href="https://www.tech.gov.sg/privacy/" target="_blank">GovTech's Privacy Policy</a>)
            return (
                <Modal 
                    isTopTitle={true}
                    showCloseButton={false}
                    modalTitle={"Get to know you"}
                    modalBody={
                        <UserDetailsForm
                            formID={formID}
                            setName={setName}
                            setEmail={setEmail}
                            userInputErrorMessage={userInputErrorMessage}
                            handleSetUserData={handleSetUserData}
                        ></UserDetailsForm>
                    }
                    modalDesc={
                        <span>
                            To personalise your experience, we will be collecting your name, email address and app usage data. Your information fully complies with {policyUrlElem}
                        </span>}
                    modalFooter={
                        <>
                            {backButton}
                            <button type="submit" form={formID} className="primary modal-half-button modal-right-button">I consent</button>
                        </>
                    }
                    key={step}
                />
            )
        }
    }
}

export default OnboardingComponent;