import { useEffect, useMemo, useState } from "react";
import Button from "../../common/components/Button";
import "./ResultPage.scss";
import services from "../../services";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as CheckCircleIcon } from "../../assets/check-circle.svg";
import { ReactComponent as BoxArrowUpRightIcon } from "../../assets/box-arrow-up-right.svg";
import { ReactComponent as ReturnIcon } from "../../assets/return.svg";
import { ReactComponent as MailIcon } from "../../assets/mail.svg";
import { ReactComponent as MailSuccessIcon } from "../../assets/mail-success.svg";
import EditMailDetailsModal from "./EditMailDetailsModal";

const ResultPage = ({ completedScanId: scanId }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [resultsPath, setResultsPath] = useState(null);
  const [showCustomFlowReplayButton, setShowCustomFlowReplayButton] =
    useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [mailStatus, setMailStatus] = useState("send");
  const [showEditMailDetailsModal, setShowEditMailDetailsModal] =
    useState(false);

  useEffect(() => {
    if (state?.isCustomScan) {
      setShowCustomFlowReplayButton(state.isCustomScan);
    }
  }, []);

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setScanType(data["scanType"]);
      setEmail(data["email"]);
      setIsEvent(data["event"]);
    };
    getDataForForm();

    (async () => {
      setIsWindows(await services.getIsWindows());
    })();
  }, []);

  useEffect(() => {
    const getResultsPath = async () => {
      const resultsPath = await services.getResultsFolderPath(scanId);
      setResultsPath(resultsPath);
    };

    getResultsPath();
  }, []);

  const initialSubject = useMemo(() => {
    if (!scanType) {
      return "";
    }

    const { scanUrl } = JSON.parse(window.localStorage.getItem("scanDetails"));

    return `[A11y] ${scanType
      .split(" ")
      .shift()} Scan Results for: ${scanUrl} (${scanType})`;
  }, [scanType]);

  const handleViewReport = () => {
    services.openReport(scanId);
  };

  const handleScanAgain = () => {
    window.services.cleanUpCustomFlowScripts();
    window.sessionStorage.removeItem("latestCustomFlowGeneratedScript");
    window.sessionStorage.removeItem("latestCustomFlowScanDetails");
    window.sessionStorage.removeItem("latestCustomFlowEncryptionParams");
    navigate("/");
    return;
  };

  const handleOpenResultsFolder = async (e) => {
    e.preventDefault();

    window.services.openResultsFolder(resultsPath);
  };

  const replayCustomFlow = async () => {
    navigate("/custom_flow", { state: { isReplay: true } });
    return;
  };

  const handleSubmitMail = async (finalEmails, finalSubject) => {
    setMailStatus("sending");

    const emails = finalEmails.split(",").join(";");
    const response = await services.mailReport(
      { subject: finalSubject, emailAddresses: emails },
      scanId
    );
    if (response.success) {
      alert("Report successfully mailed");
      setMailStatus("sent");
    } else {
      alert("Report failed to mail");
      setMailStatus("send");
    }
  };

  return (
    <div id="result-page">
      <div id="main-container">
        <div id="main-contents">
          <ButtonSvgIcon
            className={`check-circle-icon`}
            svgIcon={<CheckCircleIcon />}
          />
          <h1>Scan completed</h1>
          <p id="download-content">
            You can find the downloaded report at{" "}
            <a href="#" onClick={handleOpenResultsFolder}>
              {resultsPath}
            </a>
          </p>
          <div id="btn-container">
            <button id="scan-again" onClick={handleScanAgain}>
              <ButtonSvgIcon
                svgIcon={<ReturnIcon />}
                className={`return-icon`}
              />
              Back to Home
            </button>
            <Button id="view-button" type="primary" onClick={handleViewReport}>
              <ButtonSvgIcon
                className={`box-arrow-up-right-icon `}
                svgIcon={<BoxArrowUpRightIcon />}
              />
              {/* <i className="bi bi-box-arrow-up-right" /> */}
              View report
            </Button>
            {showCustomFlowReplayButton && (
              <Button id="replay-btn" type="primary" onClick={replayCustomFlow}>
                Replay
              </Button>
            )}
            {isWindows && isEvent && mailStatus === "send" && (
              <Button
                id="mail-report-button"
                type="primary"
                className="bold-text"
                onClick={() => setShowEditMailDetailsModal(true)}
              >
                <ButtonSvgIcon svgIcon={<MailIcon />} className={`mail-icon`} />
                Mail report
              </Button>
            )}
            {isWindows && isEvent && mailStatus === "sending" && (
              <Button
                id="mail-report-button"
                type="primary"
                className="bold-text"
                disabled="disabled"
              >
                <ButtonSvgIcon svgIcon={<MailIcon />} className={`mail-icon`} />
                Sending mail...
              </Button>
            )}
            {isWindows && isEvent && mailStatus === "sent" && (
              <Button
                id="mail-report-button"
                type="primary"
                disabled="disabled"
              >
                <ButtonSvgIcon
                  svgIcon={<MailSuccessIcon />}
                  className={`mail-icon`}
                />
                Report mailed
              </Button>
            )}
          </div>
          {showEditMailDetailsModal && (
            <EditMailDetailsModal
              showModal={showEditMailDetailsModal}
              onUpdateShowModal={setShowEditMailDetailsModal}
              onSubmitMail={handleSubmitMail}
              initialEmail={email}
              initialSubject={initialSubject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
