import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../common/components/LoadingSpinner";

const ResultPage = ({ completedScanId: scanId }) => {
  const [userDataFormOpenUnsuccessful, setUserDataFormOpenUnsuccessful] =
    useState(false);
  const [enableReportDownload, setEnableReportDownload] = useState();
  const [enableMailReport, setEnableMailReport] = useState();
  const [mailStatus, setMailStatus] = useState({
    mailSentSucessful: false,
    sendingMail: false,
    mailError: false,
  });

  useEffect(() => {
    services.openUserDataForm();
    window.services.enableReportDownload(() => setEnableReportDownload(true));
    window.services.enableMailReport((formDetails) =>
      setEnableMailReport(formDetails)
    );
    window.services.handleRetryOpenForm(() => services.openUserDataForm());
    window.services.handleFormOpenFailure(() =>
      setUserDataFormOpenUnsuccessful(true)
    );
    return () => services.closeUserDataForm();
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
    const response = await services.mailReport(enableMailReport, scanId);
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
          <i className="bi bi-check-circle"></i>
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
          {enableReportDownload ? (
            <>
              <Button
                id="view-button"
                type="primary"
                className="bold-text"
                onClick={handleViewReport}
              >
                <i className="bi bi-box-arrow-up-right" />
                View report
              </Button>
              <Button
                id="download-button"
                type="secondary"
                onClick={handleDownloadResults}
              >
                <i className="bi bi-download" />
                Download results (.zip)
              </Button>
            </>
          ) : (
            <>
              <p>Fill in the form beside to view your report.</p>
            </>
          )}
          <hr />
          <Link to="/">Scan again</Link>
        </div>
      </div>
      <div id="form-container">
        {userDataFormOpenUnsuccessful && (
          <>
            <span>
              Help us out by filling this{" "}
              {
                <a
                  href={services.getUserDataFormUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  form
                </a>
              }
              .
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
