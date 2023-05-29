import { useEffect, useState } from "react";
import Button from "../../common/components/Button";
import { userDataFormInputFields } from "../../common/constants";
import "./ResultPage.scss";
import services from "../../services";
import { Link } from "react-router-dom";
import axios from 'axios'

const ResultPage = ({ completedScanId: scanId }) => {
  // const [userDataFormOpenUnsuccessful, setUserDataFormOpenUnsuccessful] =
  //   useState(false);
  const [enableReportDownload, setEnableReportDownload] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [scanType, setScanType] = useState(null); 
  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);

  // useEffect(() => {
  //   services.openUserDataForm();
  //   window.services.enableReportDownload(() => setEnableReportDownload(true));
  //   window.services.handleRetryOpenForm(() => services.openUserDataForm());
  //   window.services.handleFormOpenFailure(() =>
  //     setUserDataFormOpenUnsuccessful(true)
  //   );
  //   return () => services.closeUserDataForm();
  // }, []);

  useEffect(() => {
    const getDataForForm = async () => {
      const data =  await services.getDataForForm();
      if (!ignore) {
        setWebsiteUrl(data['websiteUrl']); 
        setScanType(data['scanType']); 
        let isAutoSubmit = data['autoSubmit'];
        if (isAutoSubmit) {
          setEmail(data['email']); 
          setName(data['name']);
        }
        setAutoSubmit(data['autoSubmit']);
      }
    }
    let ignore = false; 
    getDataForForm();
    return () => {
      ignore = true;
    }
  })

  useEffect(() => {
    const submitForm = async () => {
      const formUrl = userDataFormInputFields.formUrl; 
  
      try {
        // Collect form data
        const formData = new FormData();
        formData.append(userDataFormInputFields.websiteUrlField, websiteUrl); 
        formData.append(userDataFormInputFields.scanTypeField, scanType); 
        formData.append(userDataFormInputFields.emailField, email); 
        formData.append(userDataFormInputFields.nameField, name);
  
        // Send POST request to Google Form
        await axios.post(formUrl, formData);
  
        // Form submission successful
        console.log('Form submitted successfully!');
      } catch (error) {
        // Handle error
        console.error('Form submission error:', error);
      }
    }
    if (autoSubmit) {
      submitForm(); 
      setEnableReportDownload(true);
    } 
  }, [autoSubmit])

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
      const formUrl = userDataFormInputFields.formUrl;
      await fetch(formUrl, {
        method: 'POST',
        body: new FormData(event.target),
      });

      setEnableReportDownload(true);
      // Form submission successful
      console.log('Form submitted successfully!');
    } catch (error) {
      // Handle error
      console.error('Form submission error:', error);
    }
  }

  return (
    <div id="result-page">
      <div id="main-container">
        <div id="main-contents">
          <i className="bi bi-check-circle"></i>
          <h1>Scan completed</h1>
            { enableReportDownload ? 
            (
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
            )
          : (
            <>
               <form id="form-container"
                className=""
                onSubmit={(e) => handleSubmitForm(e)}
              >
                <input type="hidden" id="form-website-url" name={userDataFormInputFields.websiteUrlField} value={websiteUrl}></input>
                <input type="hidden" id="form-scan-type" name={userDataFormInputFields.scanTypeField} value={scanType}></input>
                <label for="form-name">Name:</label>
                <input type="text" id="form-name" name={userDataFormInputFields.nameField} value={name} onChange={(e) => setName(e.target.value)}></input>
                <label for="form-email">Email:</label>
                <input type="text" id="form-email" name={userDataFormInputFields.emailField} value={email} onChange={(e) => setEmail(e.target.value)}></input>
                
                <Button type="submit">
                  View Results
                </Button>
              </form>
            </>
          )}
          <hr />
          <Link to="/">Scan again</Link>
        </div>
      </div>
      {/* <div id="form-container">
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
      </div> */}
    </div>
  );
};

export default ResultPage;
