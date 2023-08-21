import { useEffect, useMemo, useState } from "react";
import Button from "../../common/components/Button";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as CheckCircleIcon } from "../../assets/check-circle.svg";
import { ReactComponent as BoxArrowUpRightIcon } from "../../assets/box-arrow-up-right.svg";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";
import { ReactComponent as ReturnIcon } from "../../assets/return.svg";
import { ReactComponent as MailIcon } from "../../assets/mail.svg";
import { ReactComponent as MailSuccessIcon } from "../../assets/mail-success.svg";
import EditMailDetailsModal from "./EditMailDetailsModal";

const ResultPage = ({ completedScanId: scanId }) => {
  const [scanType, setScanType] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [mailStatus, setMailStatus] = useState("send");
  const [showEditMailDetailsModal, setShowEditMailDetailsModal] =
    useState(false);

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setScanType(data["scanType"]);
      setName(data["name"]);
      setEmail(data["email"]);
      setIsEvent(data["event"]);
    };
    getDataForForm();

    (async () => {
      setIsWindows(await services.getIsWindows());
    })();
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

  const handleDownloadResults = async () => {
    const data = await services.downloadResults(scanId);
    let blob = new Blob([data], { type: "application/zip" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "results.zip";
    link.click();
  };

  const handleViewReport = () => {
    services.openReport(scanId);
  };

  const handleSubmitMail = async (finalEmails, finalSubject) => {
    setMailStatus("sending");

    const emails = finalEmails.split(",").join(";");
    const response = await services.mailReport(
      { subject: finalSubject, name, emailAddresses: emails },
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
          <Button
            id="view-button"
            type="primary"
            className="bold-text"
            onClick={handleViewReport}
          >
            <ButtonSvgIcon
              className={`box-arrow-up-right-icon`}
              svgIcon={<BoxArrowUpRightIcon />}
            />
            View report
          </Button>
          <Button
            id="download-button"
            type="secondary"
            onClick={handleDownloadResults}
          >
            <ButtonSvgIcon
              svgIcon={<DownloadIcon />}
              className={`download-icon`}
            />
            Download results (.zip)
          </Button>
          {isEvent && mailStatus === "send" && (
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
            <Button id="mail-report-button" type="primary" disabled="disabled">
              <ButtonSvgIcon
                svgIcon={<MailSuccessIcon />}
                className={`mail-icon`}
              />
              Report mailed
            </Button>
          )}
          {showEditMailDetailsModal && (
            <EditMailDetailsModal
              showModal={showEditMailDetailsModal}
              onUpdateShowModal={setShowEditMailDetailsModal}
              onSubmitMail={handleSubmitMail}
              initialEmail={email}
              initialSubject={initialSubject}
            />
          )}
          <hr />
          <Link id="scan-again" to="/">
            <ButtonSvgIcon svgIcon={<ReturnIcon />} className={`return-icon`} />
            Scan again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
