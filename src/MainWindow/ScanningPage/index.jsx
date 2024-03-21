import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./ScanningPage.scss";
import ScanningComponent from "../../common/components/ScanningComponent";
import pagesSvg from "../../assets/first-timer-3.svg";
import { useLocation } from "react-router-dom";
import Button from "../../common/components/Button";
import ToolTip from "../../common/components/ToolTip";
import Modal from "../../common/components/Modal";
import startingUrlIcon from "../../assets/starting-url.svg";

const ScanningPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [url, setUrl] = useState(null);
  const [showCancelScanTooltip, setShowCancelScanTooltip] = useState(false);
  const [showCancelScanModal, setShowCancelScanModal] = useState(false);

  useEffect(() => {
    setUrl(state.url);
  }, []);

  const handleCancelScan = () => {
    navigate("/");
    window.services.cancelScan();
  };

  const handleCancelScanModalNo = () => {
    setShowCancelScanModal(false);
  };

  return (
    <div id="scanning-page">
      {url && (
        <>
          <div className="scanning-page-header">
            <img className="scanning-page-header-img" src={pagesSvg}></img>
            <div className="starting-url-outer-box">
              <div className="starting-url-inner-box">
                <img src={startingUrlIcon} aria-hidden="true"></img>
                <span className="starting-url">{url}</span>
              </div>
              <div className="cancel-scan-tooltip-container">
                <ToolTip
                  description="Abort scan"
                  id="cancel-scan-tooltip"
                  showToolTip={showCancelScanTooltip}
                />
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cancel scan"
                  onMouseEnter={() => setShowCancelScanTooltip(true)}
                  onMouseLeave={() => setShowCancelScanTooltip(false)}
                  onClick={() => setShowCancelScanModal(true)}
                />
              </div>
            </div>
          </div>
          <ScanningComponent
            scanningMessage={"Preparing Scan..."}
          ></ScanningComponent>
          <Modal
            id="cancelScanModal"
            isConfirm={true}
            showModal={showCancelScanModal}
            setShowModal={setShowCancelScanModal}
            showHeader={true}
            modalTitle={"Are you sure?"}
            modalSizeClass="modal-dialog-centered"
            modalBody={
              <>
                <p>
                  Aborting the scan will lose any progress and return back to
                  the home screen.
                </p>
              </>
            }
            modalFooter={
              <>
                <Button
                  type="btn-secondary"
                  className="modal-left-button"
                  onClick={handleCancelScan}
                >
                  Yes
                </Button>
                <Button
                  type="btn-primary"
                  className="modal-right-button"
                  onClick={handleCancelScanModalNo}
                >
                  No
                </Button>
              </>
            }
          />
        </>
      )}
    </div>
  );
};

export default ScanningPage;
