import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./ScanningPage.scss";
import ScanningComponent from "../../common/components/ScanningComponent";
import pagesSvg from "../../assets/first-timer-3.svg"; 
import { useLocation } from "react-router-dom";
import Button from "../../common/components/Button";

const ScanningPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const [ url, setUrl ] = useState(null); 

  useEffect(() => {
    setUrl(state.url); 
  }, []); 

  const handleCancelScan = () => {
    navigate('/');

    window.services.cancelScan()


    //remove localStorage scanItems
  };

  return (
    <div id="scanning-page">
        {url && 
          <>
          <div className="scanning-page-header">
            <img src={pagesSvg}></img>
            <span><b>URL: </b>{url}</span>
          </div>
          <div className="scanning-page-divider"></div>
          <ScanningComponent scanningMessage={"Preparing Scan..."}></ScanningComponent>
          <Button onClick={handleCancelScan}>Cancel</Button>
          </>}
    </div>
  );
};

export default ScanningPage;
