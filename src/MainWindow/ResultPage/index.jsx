import { useEffect, useState } from "react";
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

const ResultPage = ({ completedScanId: scanId }) => {
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [mailStatus, setMailStatus] = useState({
    mailSentSucessful: false,
    sendingMail: false,
    mailError: false,
  });

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setScanType(data["scanType"]);
      setEmail(data["email"]);
      setIsEvent(data["event"]);
    };
    getDataForForm();
  }, []);

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

  const handleMailReport = async () => {
    setMailStatus({ ...mailStatus, sendingMail: true });
    const { scanUrl } = JSON.parse(window.localStorage.getItem("scanDetails"));

    const response = await services.mailReport(
      { websiteUrl: scanUrl, scanType, emailAddress: email },
      scanId
    );
    if (response.success) {
      alert("Report successfully mailed");
      setMailStatus({
        mailSentSucessful: true,
        sendingMail: false,
        mailError: false,
      });
    } else {
      alert("Report failed to mail");
      setMailStatus({
        mailSentSucessful: false,
        sendingMail: false,
        mailError: true,
      });
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
          {isEvent && mailStatus.mailSentSucessful === false && (
            <>
              <Button
                id="mail-report-button"
                type="primary"
                className="bold-text"
                onClick={handleMailReport}
                disabled={mailStatus.sendingMail ? "disabled" : null}
              >
                {mailStatus.sendingMail ? (
                  <>
                    <ButtonSvgIcon
                      svgIcon={<MailIcon />}
                      className={`mail-icon`}
                    />
                    Sending mail...
                  </>
                ) : (
                  <>
                    <ButtonSvgIcon
                      svgIcon={<MailIcon />}
                      className={`mail-icon`}
                    />
                    Mail report
                  </>
                )}
              </Button>
            </>
          )}
          {isEvent && mailStatus.mailSentSucessful && (
            <Button
              id="mail-report-button"
              type="primary"
              disabled={"disabled"}
            >
              <ButtonSvgIcon
                svgIcon={<MailSuccessIcon />}
                className={`mail-icon`}
              />
              Report mailed
            </Button>
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
