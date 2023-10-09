import Button from "../../common/components/Button";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import "./ErrorPage.scss";
import returnIcon from "../../assets/return.svg";
import { useNavigate, useLocation } from "react-router";
import { ReactComponent as ExclamationCircleIcon } from "../../assets/exclamation-circle.svg";
import { useState, useEffect } from "react";

const ErrorPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isCustomScan, setIsCustomScan] = useState(false);
  const [isBrowserError, setIsBrowserError] = useState(false);

  useEffect(() => {
    if (state?.isCustomScan) {
      setIsCustomScan(state.isCustomScan);
    }

    if (state?.isBrowserError) {
      setIsBrowserError(state.isBrowserError);
    }
  }, []);

  const replayCustomFlow = async () => {
    navigate("/custom_flow", { state: { isReplay: true } });
    return;
  };

  const handleBackToHome = () => {
    if (isCustomScan) {
      window.services.cleanUpCustomFlowScripts();
      window.localStorage.removeItem("latestCustomFlowGeneratedScript");
      window.localStorage.removeItem("latestCustomFlowScanDetails");
    }
    navigate("/");
    return;
  }

  return (
    <div id="error-page">
      <ButtonSvgIcon
        className={`exclamation-circle-icon`}
        svgIcon={<ExclamationCircleIcon />}
      />
      {isBrowserError
        ? <>
            <h1>Unable to use browser to scan</h1>
            <p>Please close either Google Chrome or Microsoft Edge browser.</p>
          </>
        : <h1>Something went wrong! Please try again.</h1>
      }
      {isCustomScan
      ? (
        <>
        <button role="link" id='back-to-home-btn' onClick={handleBackToHome}>
          <img src={returnIcon}></img>
          &nbsp;Back To Home
        </button>
        <Button id="replay-btn" type="primary" onClick={replayCustomFlow}>
          Replay
        </Button>
        </>
      )
      : <Button role="link" type="primary" className='try-again-btn' onClick={handleBackToHome}>
          Try Again
        </Button>}
    </div>
  );
};

export default ErrorPage;
