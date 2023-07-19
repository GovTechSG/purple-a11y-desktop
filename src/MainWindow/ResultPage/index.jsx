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
import LoadingSpinner from "../../common/components/LoadingSpinner";

const ResultPage = ({ completedScanId: scanId }) => {
  const [enableReportDownload, setEnableReportDownload] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [scanType, setScanType] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [browser, setBrowser] = useState("");
  const [event, setEvent] = useState(false);
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
      let isEvent = data["event"];
      setEmail(data["email"]);
      setName(data["name"]);
      setEvent(data["event"]);
      if (!isEvent) {
        setEnableReportDownload(true);
      }
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

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    try {
      if (!services.isValidEmail(email)) {
        setErrorMessage("Please enter a valid email");
        return;
      }

      setEnableReportDownload(true);
      setEvent(false);
      const formUrl = userDataFormInputFields.formUrl;
      await submitFormViaBrowser(formUrl);

      // Form submission successful
      console.log("Form submitted successfully!");
    } catch (error) {
      // Handle error
      console.error("Form submission error:", error);
      // Write to error log
    }
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

  const submitFormViaBrowser = async (formUrl) => {
    const formDetails = {
      formUrl: formUrl,
      websiteUrl: websiteUrl,
      scanType: scanType,
      name: name,
      email: email,
      browser: browser,
    };
    await window.services.v(formDetails);
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
          {enableReportDownload ? (
            <>
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
                id="download-button"
                type="secondary"
                onClick={handleDownloadResults}
              >
                <ButtonSvgIcon
                  svgIcon={<DownloadIcon />}
                  className={`download-icon`}
                />
                {/* <i className="bi bi-download" /> */}
                Download results (.zip)
              </Button>
            </>
          ) : (
            <>
              <form
                id="form-container"
                className=""
                onSubmit={(e) => handleSubmitForm(e)}
              >
                <input
                  type="hidden"
                  id="form-website-url"
                  name={userDataFormInputFields.websiteUrlField}
                  value={websiteUrl}
                ></input>
                <input
                  type="hidden"
                  id="form-scan-type"
                  name={userDataFormInputFields.scanTypeField}
                  value={scanType}
                ></input>
                <label for="form-name">Name:</label>
                <input
                  type="text"
                  id="form-name"
                  name={userDataFormInputFields.nameField}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></input>
                <label for="form-email">Email:</label>
                <input
                  type="text"
                  id="form-email"
                  name={userDataFormInputFields.emailField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
                {errorMessage && <p className="error-text">{errorMessage}</p>}
                <Button type="submit">View Results</Button>
              </form>
            </>
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
