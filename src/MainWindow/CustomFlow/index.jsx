import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cliErrorCodes, cliErrorTypes } from "../../common/constants";
import services from "../../services";
import './CustomFlow.scss'; 
import recordIcon from "../../assets/record-icon.svg";
import replayIcon from "../../assets/replay-icon.svg"; 
import labelIcon from "../../assets/label-icon.svg";
import ScanningComponent from "../../common/components/ScanningComponent";
import ProgressStepComponent from "./components/ProgressStepComponent";
import CustomFlowDisplay from "./components/CustomFlowDisplay";
import ButtonWithBoxRightArrowIcon from "./components/ButtonWithBoxRightArrowIcon";
import DoneScanningStatus from "../../common/components/DoneScanningStatus";
import LoadingScanningStatus from "../../common/components/LoadingScanningStatus";

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

    useEffect(() => {
        console.log("state.scanDetails: ", state.scanDetails);
        if (state.scanDetails) {
          console.log("entered scan details");
          setScanDetails(state.scanDetails);
        }

        console.log("is replay: ", state.isReplay);
        if (state.isReplay) {
          console.log("entered is replay");
          setIsReplay(true);
          const generatedScript = window.localStorage.getItem("latestCustomFlowGeneratedScript");
          const scanDetails = JSON.parse(window.localStorage.getItem("latestCustomFlowScanDetails"));
          console.log("local storage gen script: ", generatedScript);
          console.log("local storage scan details: ", scanDetails);
          setGeneratedScript(generatedScript);
          setScanDetails(scanDetails);
          setStep(2);
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
          setGeneratedScript(response.generatedScript);
          setLoading(false);
          setDone(true);
          return;
        }

        if (cliErrorCodes.has(response.statusCode)) {
            let errorMessageToShow;
            switch (response.statusCode) {
              /* technically urlErrorTypes.invalidUrl is not needed since this case
              was handled above, but just for completeness */
              case cliErrorTypes.unauthorisedBasicAuth:
                errorMessageToShow = "Unauthorised Basic Authentication.";
                break;
              case cliErrorTypes.invalidUrl:
              case cliErrorTypes.cannotBeResolved:
              case cliErrorTypes.errorStatusReceived:
                errorMessageToShow = "Invalid URL.";
                break;
              case cliErrorTypes.notASitemap:
                errorMessageToShow = "Invalid sitemap.";
                break;
              case cliErrorTypes.profileDataCopyError:
                errorMessageToShow =
                  "Error cloning browser profile data. Try closing your opened browser(s) before the next scan.";
                break;
              case cliErrorTypes.systemError:
              default:
                errorMessageToShow = "Something went wrong. Please try again later.";
            }
            console.log(`status error: ${response.statusCode}`);
            navigate("/", { state: errorMessageToShow });
            return;
          }
          /* When no pages were scanned (e.g. out of domain upon redirects when valid URL was entered),
          redirects user to error page to going to result page with empty result
          */
          navigate("/error");
          return;
    }

    const onClickReplay = async () => {
      setLoading(true); 
      await startReplaying();
    }

    const startReplaying = async () => {
        const response = await window.services.startReplay(generatedScript, scanDetails, isReplay);

        if (response.success) {
            setCompletedScanId(response.scanId);   
            setLoading(false);
            setDone(true);
            return;         
        }

        navigate("/error");
        return;
    } 

    const generateReport =  () => {
      if (customFlowLabel.length > 0) {
        window.services.generateReport(customFlowLabel, completedScanId); 
      }
      window.localStorage.setItem("latestCustomFlowGeneratedScript", generatedScript); 
      window.localStorage.setItem("latestCustomFlowScanDetails", JSON.stringify(scanDetails));
      navigate("/result", {state: { isCustomScan: true }});
      return;
    }

    const currentDisplay = () => {
        console.log("current display: ", scanDetails);
        switch (step) {
          case 1: {
            return (
              <>
                <CustomFlowDisplay 
                  icon={recordIcon}
                  step={1}
                  title={"Record"}
                  url={scanDetails.scanUrl}
                  description={
                    <>
                      Record your custom flow by manually navigating on a new browser window. In the event of a login page, we will solely capture your credentials for this scan and promptly remove them thereafter.
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
          case 2: {
            return (
              <>
                <CustomFlowDisplay
                  icon={replayIcon}
                  step={2}
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
          case 3: {
            return (
              <>
                <CustomFlowDisplay
                  icon={labelIcon}
                  step={3}
                  title={"Label"}
                  url={scanDetails.scanUrl}
                  description={"Assign a recognisable label to this custom flow for convenient reference in the report."}
                />
                <label className="custom-label-form-label" for="custom-label-input">Custom Flow Label</label>
                <form id="custom-label-form" onSubmit={() => {generateReport()}}>
                  <input id="custom-label-input" type="text" onChange={(e) => setCustomFlowLabel(e.target.value)}></input>
                  <button type="submit" className="primary custom-label-button">Generate Report</button>
                </form>
              </>
            )
          }
        }
    }

    return (
      <div id="custom-flow">
        { scanDetails && 
          (
            isReplay 
            ? 
              <>
                <div className="custom-flow-content">{currentDisplay()}</div>
              </>
            : 
              <>
                <ProgressStepComponent step={step}></ProgressStepComponent>
                <div className="custom-flow-content">{currentDisplay()}</div>
              </>
          )
        }
      </div>
    )
}

export default CustomFlowPage;