import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import "../../styles/Scanning.css";
import "../../styles/ResultPage.css";
import Button from "../components/Button";
import ToolTipButton from "../components/ToolTipButton";
import { downloadReport, openReport } from "../../services";

const ResultPage = ({ scanId }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleDownloadReport = async () => { 
    const data = await downloadReport(scanId);
    let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "report.html";
    link.click();
  };

  const handleViewReport = () => {
    openReport(scanId);
  };

  useEffect(() => {
    if (location.state === null) {
      navigate("/error");
    }
  }, []);

  if (location.state === "scanning" && scanId === null) {
    return (
      <>
        <Loading className="loader" />
        <div className="doyouknow">
          <div className="tip-card">
            <div className="tip-title">Do you know?</div>
            <p className="tip">
              Do you know many assistive technologies rely on keyboard-only
              navigation? <br />
              <br />
              So for a website to be accessible, it must work without the use of
              a mouse.
            </p>
          </div>
        </div>
        <div className="developed-text">Built by Accessiblity Enabling Team, GovTech</div>
        <div className="link-options">
          <ToolTipButton />
        </div>
      </>
    );
  } else {
    return (
      <>
        <div variant="h1" className="scan-complete">
          Scan completed
        </div>
        <div className="download-div">
          <Button
            className={"download-button"}
            title={"View report"}
            style={{ marginRight: '8px' }}
            action={() => handleViewReport()}
          />
          <Button
            type="download"
            className={"download-button"}
            title={"Download report"}
            id="downloadButton"
            action={() => handleDownloadReport()}
          />

          <div className="scan-link">
            <Link to='/'>Scan again</Link>
          </div>
        </div>
        <div className="developed-text">Built by Accessiblity Enabling Team, GovTech</div>
        <div className="link-options">
          <ToolTipButton />
        </div>
      </>
    );
  }
};

export default ResultPage;
