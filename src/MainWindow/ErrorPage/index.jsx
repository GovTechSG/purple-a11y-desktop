import Button from "../../common/components/Button";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import "./ErrorPage.scss";
import returnIcon from "../../assets/return-purple.svg";
import { useNavigate, useLocation } from "react-router";
import { ReactComponent as ExclamationCircleIcon } from "../../assets/exclamation-circle.svg";
import { useState, useEffect } from "react";
import { errorStates } from "../../common/constants";
import services from "../../services"

const ErrorPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ errorState, setErrorState ] = useState('');
  const [errorLog, setErrorLog] = useState(null);

  useEffect(() => {
    if (state?.errorState) setErrorState(state.errorState);
    const getErrorLog = async () => {
      const timeOfScan = state?.timeOfScan;
      const timeOfError = new Date();
      const log = await services.getErrorLog(timeOfScan, timeOfError);
      setErrorLog(log);
    }
    getErrorLog();
  }, []);

  const replayCustomFlow = async () => {
    navigate("/custom_flow", { state: { isReplay: true } });
    return;
  };

  const handleBackToHome = () => {
    if (errorState === errorStates.customScanError) {
      window.services.cleanUpCustomFlowScripts();
      window.localStorage.removeItem("latestCustomFlowGeneratedScript");
      window.localStorage.removeItem("latestCustomFlowScanDetails");
    }
    navigate("/");
    return;
  }

  const errorMessageToDisplay = () => {
    switch (errorState) {
      case errorStates.browserError:
        return (
          <>
            <h1>Unable to use browser to scan</h1>
            <p>Please close either Google Chrome or Microsoft Edge browser.</p>
          </>
        )
      case errorStates.noPagesScannedError:
        return (<><h1>No pages were scanned.</h1></>)
      default:
        return (<><h1>Something went wrong! Please try again.</h1></>)
    }

  }

  const copyErrorLog=() => {
    navigator.clipboard.writeText(errorLog).then(() => {
      alert("Copied the text: " + errorLog.slice(0, 1000));
    });  
  }

  return (
    <div id="error-page">
      <ButtonSvgIcon
        className={`exclamation-circle-icon`}
        svgIcon={<ExclamationCircleIcon />}
      />
      {errorMessageToDisplay()}
      <div class='btn-container'>
        {errorState === errorStates.customScanError
          ? (
            <>
            <button role="link" id='back-to-home-btn' onClick={handleBackToHome}>
              <img src={returnIcon}></img>
              &nbsp;Back To Home
            </button>
            <Button id="replay-btn" type="btn-primary" onClick={replayCustomFlow}>
              Replay
            </Button>
            </>
          )
          : <Button role="link" type="btn-primary" onClick={handleBackToHome}>
              Try Again
            </Button>}
          {errorLog&&<Button type="btn-secondary" onClick={copyErrorLog}>Copy Error Log</Button>}

      </div>
    </div>
  );
};

export default ErrorPage;


