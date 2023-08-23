import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import { userDataFormInputFields } from "../../common/constants";
import "./ResultPage.scss";
import services from "../../services";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as CheckCircleIcon } from "../../assets/check-circle.svg";
import { ReactComponent as BoxArrowUpRightIcon } from "../../assets/box-arrow-up-right.svg";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";
import { ReactComponent as ReturnIcon } from "../../assets/return.svg";

const ResultPage = ({ completedScanId: scanId }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [browser, setBrowser] = useState("");
  const [event, setEvent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [resultsPath, setResultsPath] = useState(null);
  const [showCustomFlowReplayButton, setShowCustomFlowReplayButton] = useState(false);

  useEffect(() => {
    console.log('is custom flow: ', state);
    setShowCustomFlowReplayButton(state.isCustomScan);
  }, [])

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setWebsiteUrl(data["websiteUrl"]);
      setScanType(data["scanType"]);
      setBrowser(data["browser"]);
      setEmail(data["email"]);
      setName(data["name"]);
      setEvent(data["event"]);
    };
    getDataForForm();
  }, []);

  useEffect(() => {
    const getResultsPath = async () => {
      const resultsPath = await services.getResultsFolderPath(scanId); 
      setResultsPath(resultsPath);
    }

    getResultsPath();
  }, [])

  const handleViewReport = () => {
    services.openReport(scanId);
  };

  const handleScanAgain = () => {
    window.services.cleanUpCustomFlowScripts();
    window.localStorage.removeItem("latestCustomFlowGeneratedScript"); 
    window.localStorage.removeItem("latestCustomFlowScanDetails");
    navigate("/");
    return;
  }

  const handleOpenResultsFolder = async (e) => {
    e.preventDefault(); 

    window.services.openResultsFolder(resultsPath);
  }

  const replayCustomFlow = async () => {
    // need scan details and generated 
    // store latest generated script in local storage or pass as variable 
    // what to display if user replays :>

    // const generatedScript = window.localStorage.getItem("latestCustomFlowGeneratedScript"); 
    // const scanDetails = window.localStorage.getItem("latestCustomFlowScanDetails"); 
    // const response = await window.services.startReplay(generatedScript, scanDetails);
    // if (response.success) {
    //   console.log(response);
    //   setCompletedScanId(response.scanId);   
    //   setLoading(false);
    //   setDone(true);
    //   return;         
    // }

    // navigate("/error");
    // return;
    navigate("/custom_flow", { state: { isReplay: true}});
    return;
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    try {
      if (!services.isValidEmail(email)) {
        setErrorMessage("Please enter a valid email");
        return;
      }
      setEvent(false);
      const formUrl = userDataFormInputFields.formUrl;
      await submitFormViaBrowser(formUrl);

      // const formData = new FormData(event.target);
      // await axios.post(formUrl, formData);

      // Form submission successful
      console.log("Form submitted successfully!");
    } catch (error) {
      // Handle error
      console.error("Form submission error:", error);
      // Write to error log
    }
  };

  const submitFormViaBrowser = async (formUrl) => {
    const formDetails = {
      formUrl: formUrl,
      websiteUrl: websiteUrl,
      scanType: scanType,
      name: name,
      email: email,
      browser: browser,
    };
    await window.services.submitFormViaBrowser(formDetails);
  };

  return (
    <div id="result-page">
      <div id="main-container">
        <div id="main-contents">
          <ButtonSvgIcon
            className={`check-circle-icon`}
            svgIcon={<CheckCircleIcon />}
          />
          {/* <i className="bi bi-check-circle"></i> */}
          <h1>Scan completed</h1>
          {!event ? (
            <>
              <p id="download-content">
                You can find the downloaded report at <a href="#" onClick={handleOpenResultsFolder}>{resultsPath}</a>
              </p>
              <div id="btn-container">
                  <button id="scan-again" onClick={handleScanAgain}>
                    <ButtonSvgIcon svgIcon={<ReturnIcon/>} className={`return-icon`}/>
                    Back to Home
                  </button>
                  <Button
                    id="view-button"
                    type="primary"
                    onClick={handleViewReport}
                  >
                    <ButtonSvgIcon
                      className={`box-arrow-up-right-icon `}
                      svgIcon={<BoxArrowUpRightIcon />}
                    />
                    {/* <i className="bi bi-box-arrow-up-right" /> */}
                    View report
                  </Button>
                  { showCustomFlowReplayButton &&
                      <Button
                        id="replay-btn"
                        type="primary"
                        onClick={replayCustomFlow}
                      >
                        Replay
                      </Button>
                  }
              </div>
              </>
          ) : (
            <>
              <form
                id="form-container"
                className=""
                onSubmit={(e) => handleSubmitForm(e)}
              >
                <input
                  type="hidden"
                  id="form-website-url"
                  name={userDataFormInputFields.websiteUrlField}
                  value={websiteUrl}
                ></input>
                <input
                  type="hidden"
                  id="form-scan-type"
                  name={userDataFormInputFields.scanTypeField}
                  value={scanType}
                ></input>
                <label for="form-name">Name:</label>
                <input
                  type="text"
                  id="form-name"
                  name={userDataFormInputFields.nameField}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></input>
                <label for="form-email">Email:</label>
                <input
                  type="text"
                  id="form-email"
                  name={userDataFormInputFields.emailField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
                {errorMessage && <p className="error-text">{errorMessage}</p>}
                <Button type="submit">View Results</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
