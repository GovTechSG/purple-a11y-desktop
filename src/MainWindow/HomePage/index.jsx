import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import a11yLogo from "../../assets/a11y-logo.svg";
import appIllustration from "../../assets/app-illustration.svg";
import InitScanForm from "./InitScanForm";
import "./HomePage.scss";
import services from "../../services";
import { urlErrorCodes, urlErrorTypes } from "../../common/constants";

const HomePage = ({ appVersion, setCompletedScanId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUrlErrorMessage, setPrevUrlErrorMessage] = useState(
    location.state
  );
  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [browserBased, setBrowserBased] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const userData = await services.getUserData();
      const isEvent = userData['event']; 
      if (!isEvent) {
        setEmail(userData['email']); 
        setName(userData['name']); 
        setAutoSubmit(userData['autoSubmit']);
        setBrowserBased(userData['browserBased'])
      }
    }

    getUserData();
  });

  const isValidHttpUrl = (input) => {
    const regexForUrl = new RegExp("^(http|https):/{2}.+$", "gmi");
    return regexForUrl.test(input);
  };

  const startScan = async (scanDetails) => {
    scanDetails.browserBased = browserBased;
    
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
  
};

export default HomePage;
