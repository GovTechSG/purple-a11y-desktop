import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";

const ResultPage = ({ completedScanId: scanId }) => {
  const [enableReportDownload, setEnableReportDownload] = useState();

  useEffect(() => {
    services.openUserDataForm();
    window.services.enableReportDownload(() => setEnableReportDownload(true));
    return () => services.closeUserDataForm();
  }, []);

  const handleDownloadReport = async () => {
    const data = await services.downloadReport(scanId);
    let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "report.html";
    link.click();
  };

  const handleViewReport = () => {
    services.openReport(scanId);
  };

  return (
    <div id="result-page">
      <div id="main-container">
        <div id="main-contents">
          <i className="bi bi-check-circle"></i>
          <h1>Scan completed</h1>
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
                onClick={handleDownloadReport}
              >
                <i className="bi bi-download" />
                Download report (.html)
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
      <div id="form-container" />
    </div>
  );
};

export default ResultPage;
