import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import services from "../../services";
import './CustomFlow.scss';
import labelIcon from "../../assets/label-icon.svg";
import CustomFlowDisplay from "./components/CustomFlowDisplay";


const CustomFlowPage = ({ completedScanId, setCompletedScanId }) => {
    const { state }= useLocation(); 
    const navigate = useNavigate();
    const [scanDetails, setScanDetails] = useState(null);
    const [customFlowLabel, setCustomFlowLabel] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState(null);

    useEffect(() => {
        if (state?.scanDetails) {
          setScanDetails(state.scanDetails);
        }
    }, [])

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
        window.localStorage.setItem("latestCustomFlowScanDetails", JSON.stringify(scanDetails));
        navigate("/result", {state: {customFlowLabel: customFlowLabel }});  
      }
      return;
    }

    const currentDisplay = () => {
        return (
          <>
            <CustomFlowDisplay
              icon={labelIcon}
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
              <button type="submit" className={`btn-primary custom-label-button`} disabled={inputErrorMessage}>Generate Report</button>
            </form>
          </>
        )
    }


    return (
      <div id="custom-flow">
        { scanDetails && 
          <>
            <div className="custom-flow-content">{currentDisplay()}</div>
          </>
        }
      </div>
    )
}

export default CustomFlowPage;