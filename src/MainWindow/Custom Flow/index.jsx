import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cliErrorCodes, cliErrorTypes } from "../../common/constants";
import services from "../../services";

const CustomFlowPage = ({ completedScanId, setCompletedScanId }) => {
    const { state }= useLocation(); 
    const navigate = useNavigate();
    const [scanDetails, setScanDetails] = useState(null);
    const [generatedScript, setGeneratedScript] = useState(null);

    useEffect(() => {
        console.log(state.scanDetails);
        setScanDetails(state.scanDetails);
    }, [])
        
    // start scan 
    // get generated script name 
    const startRecording = async () => {
        const response = await services.startScan(scanDetails);
        console.log(response);

        if (response.success) {
          console.log(response.generatedScript);
          setGeneratedScript(response.generatedScript);
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

    const startReplaying = async () => {
        console.log(scanDetails);
        console.log(generatedScript);
        const response = await window.services.startReplay(generatedScript, scanDetails);

        if (response.success) {
            console.log(response);
            setCompletedScanId(response.scanId);   
            return;         
        }

        navigate("/error");
        return;
    } 

    const generateReport =  (e) => {
        e.preventDefault();
        console.log(completedScanId);
        console.log(e.target[0].value);
        window.services.generateReport(e.target[0].value, completedScanId); 
        navigate("/result");
        return;
    }

    return (
        <div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={startReplaying}>Start Replaying</button>
            <form onSubmit={(e) => {generateReport(e)}}>
              <input type="text"></input>
              <button type="submit">Generate Report</button>
            </form>
        </div>
    )
}

export default CustomFlowPage;