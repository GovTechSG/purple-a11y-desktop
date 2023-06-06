import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import a11yLogo from "../../assets/a11y-logo.svg";
import appIllustration from "../../assets/app-illustration.svg";
import InitScanForm from "./InitScanForm";
import "./HomePage.scss";
import services from "../../services";
import { urlErrorCodes, urlErrorTypes } from "../../common/constants";
import OnboardingComponent from "./OnboardingComponent";

const HomePage = ({ appVersion, setCompletedScanId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUrlErrorMessage, setPrevUrlErrorMessage] = useState(
    location.state
  );
  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [userInputErrorMessage, setUserInputErrorMessage] = useState('');
  const [dataExistStatus, setDataExistStatus] = useState(null);

  useEffect(() => {
    window.services.userDataExists((status) => {
      console.log(status);
      setDataExistStatus(status)
    })
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      const userData = await services.getUserData();
      // if no user data then i set?
      const isEvent = userData['event']; 
      if (!isEvent) {
        setEmail(userData['email']); 
        setName(userData['name']); 
        setAutoSubmit(userData['autoSubmit']);
      }
    }

    if (dataExistStatus == "exists") {
      getUserData();
    }
  }, [dataExistStatus]);

  const isValidHttpUrl = (input) => {
    const regexForUrl = new RegExp("^(http|https):/{2}.+$", "gmi");
    return regexForUrl.test(input);
  };

  const startScan = async (scanDetails) => {
    if (scanDetails.scanUrl.length === 0) {
      setPrevUrlErrorMessage("URL cannot be empty.");
      return;
    }
    if (!isValidHttpUrl(scanDetails.scanUrl)) {
      setPrevUrlErrorMessage("Invalid URL.");
      return;
    }
    if (!navigator.onLine) {
      setPrevUrlErrorMessage("No internet connection.");
      return;
    }

    navigate("/scanning");
    const response = await services.startScan(scanDetails);

    if (response.success) {
      setCompletedScanId(response.scanId);
      navigate("/result");
      return;
    }
    if (urlErrorCodes.has(response.statusCode)) {
      let errorMessageToShow;
      switch (response.statusCode) {
        /* technically urlErrorTypes.invalidUrl is not needed since this case
        was handled above, but just for completeness */
        case urlErrorTypes.invalidUrl:
        case urlErrorTypes.cannotBeResolved:
        case urlErrorTypes.errorStatusReceived:
          errorMessageToShow = "Invalid URL.";
          break;
        case urlErrorTypes.notASitemap:
          errorMessageToShow = "Invalid sitemap.";
          break;
        case urlErrorTypes.systemError:
        default:
          errorMessageToShow = "Something went wrong. Please try again later.";
      }
      navigate("/", { state: errorMessageToShow });
      return;
    }

    navigate("/error");
  };

  const handleSetUserData =  (event) =>  {
    event.preventDefault();

    if (!services.isValidEmail(email)) {
      setUserInputErrorMessage('Please enter a valid email.'); 
      return;
    }

    window.services.setUserData({name: name, email: email, autoSubmit: true});
    setDataExistStatus("exists");
  }

  if (dataExistStatus === "doesNotExist") {
    return (
      <OnboardingComponent 
        handleSetUserData={handleSetUserData} 
        setName={setName}
        setEmail={setEmail}
        userInputErrorMessage={userInputErrorMessage}
      />
    )
  }

  if (dataExistStatus === "exists") {
    return (
      <div id="home-page">
        <div id="home-page-main">
          <img
            id="a11y-logo"
            src={a11yLogo}
            alt="Logo of the GovTech Accessibility Enabling Team"
          />
          <h1 id="app-title">Accessibility Site Scanner</h1>
          <InitScanForm
            startScan={startScan}
            prevUrlErrorMessage={prevUrlErrorMessage}
          />
          {autoSubmit && 
            (<div id="user-details">
              <div>{name}</div>
              <div>{email}</div>
            </div>)
          }
        </div>
        <div id="home-page-footer">
          <img
            id="app-illustration"
            src={appIllustration}
            alt="Illustration showing people with sight, hearing, motor and cognitive disabilities"
          />
          <span id="footer-text">
            Version {appVersion} | Built by GovTech Accessibility Enabling Team
          </span>
        </div>
      </div>
    );
  }

  return null;
  
};

export default HomePage;
