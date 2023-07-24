import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import { userDataFormInputFields } from "../../common/constants";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as CheckCircleIcon } from "../../assets/check-circle.svg";
import { ReactComponent as BoxArrowUpRightIcon } from "../../assets/box-arrow-up-right.svg";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";
import { ReactComponent as ReturnIcon } from "../../assets/return.svg";

const ResultPage = ({ completedScanId: scanId }) => {
  const [enableReportDownload, setEnableReportDownload] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [browser, setBrowser] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [enableMailReport, setEnableMailReport] = useState();
  const [mailStatus, setMailStatus] = useState({
    mailSentSucessful: false,
    sendingMail: false,
    mailError: false,
  });

  useEffect(() => {
    const getDataForForm = async () => {
      const data = await services.getDataForForm();
      setWebsiteUrl(data["websiteUrl"]);
      setScanType(data["scanType"]);
      setBrowser(data["browser"]);
      setEmail(data["email"]);
      setName(data["name"]);
      setIsEvent(data["event"]);
      setEnableReportDownload(true);
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
    const response = await services.mailReport(
      { websiteUrl, scanType, email },
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
          {/* <i className="bi bi-check-circle"></i> */}
          <h1>Scan completed</h1>
          {enableReportDownload &&
            enableMailReport &&
            mailStatus.mailSentSucessful === false && (
              <>
                <Button
                  id="mail-button"
                  type="secondary"
                  className="bold-text"
                  onClick={handleMailReport}
                  disabled={mailStatus.sendingMail ? "disabled" : null}
                >
                  {mailStatus.sendingMail ? (
                    <>Sending mail...</>
                  ) : (
                    <>
                      <i className="bi bi-envelope" />
                      Mail report
                    </>
                  )}
                </Button>
              </>
            )}
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
            {/* <i className="bi bi-box-arrow-up-right" /> */}
            View report
          </Button>
          <Button
            id="mail-button"
            type="secondary"
            onClick={handleDownloadResults}
          >
            <ButtonSvgIcon
              svgIcon={<DownloadIcon />}
              className={`download-icon`}
            />
            Download results (.zip)
          </Button>
          {isEvent && (
            <Button
              id="download-button"
              type="secondary"
              onClick={handleMailReport}
            >
              <ButtonSvgIcon
                svgIcon={<DownloadIcon />}
                className={`download-icon`}
                disabled={mailStatus.sendingMail ? true : false}
              />
              <i className="bi bi-envelope" />
              Mail results
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
