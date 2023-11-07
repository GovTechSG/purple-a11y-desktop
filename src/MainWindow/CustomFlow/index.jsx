import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cliErrorCodes, cliErrorTypes } from "../../common/constants";
import services from "../../services";
import './CustomFlow.scss';
import arrowLeft from "../../assets/arrow-left.svg";
import arrowRightGrey from "../../assets/arrow-right-grey.svg";
import arrowRightWhite from "../../assets/arrow-right-white.svg";
import editIcon from "../../assets/box-edit.svg";
import exclaimTriangleIcon from "../../assets/exclamation-triangle.svg";
import thumbsUpIcon from "../../assets/hand-thumbs-up.svg";
import recordIcon from "../../assets/record-icon.svg";
import replayIcon from "../../assets/replay-icon.svg"; 
import labelIcon from "../../assets/label-icon.svg";
import ScanningComponent from "../../common/components/ScanningComponent";
import ProgressStepComponent from "./components/ProgressStepComponent";
import CustomFlowDisplay from "./components/CustomFlowDisplay";
import ButtonWithBoxRightArrowIcon from "./components/ButtonWithBoxRightArrowIcon";
import DoneScanningStatus from "../../common/components/DoneScanningStatus";
import LoadingScanningStatus from "../../common/components/LoadingScanningStatus";
import Alert from "../../common/components/Alert";
import { Link } from "react-router-dom";

const PrepareStep = ({ scanDetails, setStep, setScanDetails }) => {
  const [isPostLogin, setIsPostLogin] = useState(null);
  const [isFileUpload, setIsFileUpload] = useState(null);
  const [fileUploadFolder, setFileUploadFolder] = useState(undefined);

  useEffect(() => {
    const getUploadFolderPath = async () => {
      const path = await services.getUploadFolderPath();
      setFileUploadFolder(path);
    };
    getUploadFolderPath();
  }, []);

  const handleOpenUploadFolder = async (e) => {
    e.preventDefault();
    window.services.openResultsFolder(fileUploadFolder);
  };

  const onClickNextStep = (e) => {
    e.preventDefault();
    // get responses
    const scanMetadata = { isPostLogin, isFileUpload };
    const newScanDetails = { ...scanDetails, scanMetadata };
    setScanDetails(newScanDetails);
    setStep(2);
  };

  const handleCheckInput = (setState, stateVal) => {
    return (e) => {
      e.target.checked = true;
      setState(stateVal);
    };
  };

  const isAllSet = isPostLogin !== null && isFileUpload !== null && !isPostLogin && !isFileUpload;
  const isButtonDisabled = isPostLogin === null || isFileUpload === null;

  return (
    <>
      <CustomFlowDisplay
        icon={editIcon}
        step={1}
        title="Prepare"
        url={scanDetails.scanUrl}
      />
      <form onSubmit={onClickNextStep}>
        <fieldset className="prepare-form-section">
          <legend className="prepare-form-legend bold-text">1. Does your custom flow have any post-login webpages?</legend>
          <div className="form-check py-2">
            <input className="form-check-input" name="post-login" id="post-login-yes-input" type="radio" value={isPostLogin} onChange={handleCheckInput(setIsPostLogin, true)} />
            <label className="form-check-label" for="post-login-yes-input">Yes</label>
          </div>
          <div className="form-check py-2">
            <input className="form-check-input" name="post-login" id="post-login-no-input" type="radio" value={!isPostLogin} onChange={handleCheckInput(setIsPostLogin, false)} />
            <label className="form-check-label" for="post-login-no-input">No</label>
          </div>
          {isPostLogin &&
          <Alert alertClassName="alert-custom mt-3" icon={exclaimTriangleIcon}>
            Ensure post-login webpages can be revisited using the same login credentials to allow Purple HATS to replay the steps for scanning.
          </Alert>}
        </fieldset>
        
        <fieldset className="prepare-form-section">
          <legend className="prepare-form-legend bold-text">2. Does your custom flow have any file upload fields?</legend>
          <div className="form-check py-2">
            <input className="form-check-input" name="file-upload" id="file-upload-yes-input" type="radio" value={isFileUpload} onChange={handleCheckInput(setIsFileUpload, true)} />
            <label className="form-check-label" for="file-upload-yes-input">Yes</label>
          </div>
          <div className="form-check py-2">
            <input className="form-check-input" name="file-upload" id="file-upload-no-input" type="radio" value={!isFileUpload} onChange={handleCheckInput(setIsFileUpload, false)} />
            <label className="form-check-label" for="file-upload-no-input">No</label>
          </div>
          {isFileUpload && fileUploadFolder && 
          <Alert alertClassName="alert-custom mt-3" icon={exclaimTriangleIcon}>
            If form contains file upload fields, place the same file{"(s)"} in{" "}
            <a href="#" onClick={handleOpenUploadFolder}>{fileUploadFolder}</a>{" "}
            to allow Purple HATS to attach the same file{"(s)"} when replaying the steps.
          </Alert>}
        </fieldset>

        {isAllSet && 
        <Alert alertClassName="alert-custom mb-5" icon={thumbsUpIcon}>
          It looks like you're all set for the custom flow scan, let's get started!
        </Alert>}
        <button className={`primary custom-flow-button ms-auto`} type="submit" disabled={isButtonDisabled}>
          Next step&nbsp;
          <img src={isButtonDisabled ? arrowRightGrey : arrowRightWhite}></img>
        </button>
      </form>
    </>
  )
};

const CustomFlowPage = ({ completedScanId, setCompletedScanId }) => {
    const { state }= useLocation(); 
    const navigate = useNavigate();
    const [scanDetails, setScanDetails] = useState(null);
    const [generatedScript, setGeneratedScript] = useState(null);
    const [customFlowLabel, setCustomFlowLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [step, setStep] = useState(1); 
    const [isReplay, setIsReplay] = useState(false);
    const [inputErrorMessage, setInputErrorMessage] = useState(null);

    useEffect(() => {
        if (state?.scanDetails) {
          setScanDetails(state.scanDetails);
        }

        if (state?.isReplay) {
          setIsReplay(true);
          const generatedScript = window.sessionStorage.getItem("latestCustomFlowGeneratedScript");
          const scanDetails = JSON.parse(window.sessionStorage.getItem("latestCustomFlowScanDetails"));
          let encryptionParams = window.sessionStorage.getItem('latestCustomFlowEncryptionParams'); 
          if (encryptionParams) {
            scanDetails.encryptionParams = JSON.parse(encryptionParams);
            window.sessionStorage.removeItem('latestCustomFlowEncryptionParams');
          }
          setGeneratedScript(generatedScript);
          setScanDetails(scanDetails);
          setStep(3);
        }
    }, [])

    useEffect(() => {
      if (done) {
        const timer = setTimeout(() => {
          setStep(step + 1);
          setDone(false);
        }, 3000)

        return () => {
          window.clearTimeout(timer);
        }
      }
    }, [done])

    const onClickRecord = async () => {
      setLoading(true);
      await startRecording();
    }
        
    const startRecording = async () => {
        const response = await services.startScan(scanDetails);

        if (response.success) {
          window.sessionStorage.setItem("latestCustomFlowGeneratedScript", response.generatedScript); 
          window.sessionStorage.setItem("latestCustomFlowScanDetails", JSON.stringify(scanDetails));
          setGeneratedScript(response.generatedScript);
          setLoading(false);
          setDone(true);
          return;
        }
    }

    const onClickReplay = async () => {
      setLoading(true); 
      await startReplaying();
    }

    const startReplaying = async () => {
      const response = await window.services.startReplay(generatedScript, scanDetails, isReplay);

      if (response.success) {
          window.sessionStorage.setItem('latestCustomFlowEncryptionParams', JSON.stringify(response.encryptionParams));
          setCompletedScanId(response.scanId);   
          setLoading(false);
          setDone(true);
          return;         
      }

      navigate("/error", {state: { isCustomScan: true }});
      return;
    } 

    const validateLabel = () => {
      const {isValid, errorMessage} = services.isValidCustomFlowLabel(customFlowLabel);
      if (!isValid) {
        setInputErrorMessage(errorMessage);
        return false; 
      } 
      return true;
    }

    const onHandleLabelChange = (e) => {
      setInputErrorMessage(null);
      setCustomFlowLabel(e.target.value);
    }

    const generateReport = (e) => {
      e.preventDefault();

      const validated = validateLabel();
      if (validated) {
        window.services.generateReport(customFlowLabel.trim(), completedScanId); 
        window.localStorage.setItem("latestCustomFlowGeneratedScript", generatedScript); 
        window.localStorage.setItem("latestCustomFlowScanDetails", JSON.stringify(scanDetails));
        navigate("/result", {state: { isCustomScan: true, customFlowLabel: customFlowLabel }});  
      }
      return;
    }

    const currentDisplay = () => {
        switch (step) {
          case 1: {
            return (
              <PrepareStep scanDetails={scanDetails} setStep={setStep} setScanDetails={setScanDetails} />
            )
          }
          case 2: {
            return (
              <>
                <CustomFlowDisplay 
                  icon={recordIcon}
                  step={2}
                  title={"Record"}
                  url={scanDetails.scanUrl}
                  description={
                    <>
                      Record your custom flow by manually navigating on a new browser window that will open automatically after starting the recording. In the event of a login page, we will solely capture your credentials for this scan and promptly remove them thereafter.
                      <br></br><br></br>
                      After finishing your flow, please close the browser to continue to the next step.
                    </>}
                />
                { !loading 
                  ? done 
                    ? <DoneScanningStatus/>
                    : <ButtonWithBoxRightArrowIcon onClick={onClickRecord}  buttonLabel='Start Recording'/> 
                  : <LoadingScanningStatus scanningMessage='Recording...' /> 
                }
              </>
            )
          }
          case 3: {
            return (
              <>
                <CustomFlowDisplay
                  icon={replayIcon}
                  step={3}
                  title={"Replay"}
                  url={scanDetails.scanUrl}
                  description={"Purple HATS will replay and scan the recorded flow on a new browser window."}
                />
                { !loading 
                    ? done 
                      ? <DoneScanningStatus />
                      : <ButtonWithBoxRightArrowIcon onClick={onClickReplay} buttonLabel='Start Replaying' /> 
                    : <ScanningComponent scanningMessage={"Replaying & Scanning..."}></ScanningComponent>
                }
              </>
            )
          }
          case 4: {
            return (
              <>
                <CustomFlowDisplay
                  icon={labelIcon}
                  step={4}
                  title={"Label"}
                  url={scanDetails.scanUrl}
                  description={"Assign a recognisable label to this custom flow for convenient reference in the report."}
                />
                <label className="custom-label-form-label" for="custom-label-input">Custom Flow Label</label>
                <form id="custom-label-form" onSubmit={(e) => {generateReport(e)}}>
                  <input 
                    id="custom-label-input" 
                    type="text" 
                    onChange={onHandleLabelChange} 
                    onBlur={validateLabel}
                    aria-describedby="invalid-label-error"
                    aria-invalid={!!inputErrorMessage}
                  />
                  <div className="error-text" id="invalid-label-error">{inputErrorMessage}</div>
                  <button type="submit" className={`primary custom-label-button`} disabled={inputErrorMessage}>Generate Report</button>
                </form>
              </>
            )
          }
        }
    }

    return (
      <div id="custom-flow">
        { scanDetails && 
          <>
            <div>
              {/* <div class="mb-2">
                <Link to="/" className="text-decoration-none">
                  <img src={arrowLeft} alt=""></img>
                  &nbsp;Back to Home
                </Link>
              </div> */}
              <ProgressStepComponent step={step}></ProgressStepComponent>
            </div>
            <div className="custom-flow-content">{currentDisplay()}</div>
          </>
        }
      </div>
    )
}

export default CustomFlowPage;