// const { formFieldIds } = require("./constants.js");
const { ipcRenderer } = require("electron");

const formFieldIds = {
  urlScannedField: "641d6f416e65530012b57e29",
  scanTypeField: "641d6fc6448fc900122f8684",
  emailField: "641d6ff76e65530012b59a74",
  nameField: "641d70139536740011615009"
}

let websiteURL = "";
let scanType = "";
let emailAddress = "";

window.addEventListener("load", () => {
  const websiteURLElement = document.getElementById(formFieldIds.urlScannedField);
  const scanTypeElement = document.getElementById(formFieldIds.scanTypeField);
  websiteURL = websiteURLElement.value;
  scanType = scanTypeElement.value;
  const emailAddressElement = document.getElementById(formFieldIds.emailField);

  const handleURLChange = (e) => {
    websiteURL = e.target.value;
  };
  const handleScanTypeChange = (e) => {
    scanType = e.target.value;
  };
  const handleEmailChange = (e) => {
    emailAddress = e.target.value;
  };

  websiteURLElement.addEventListener("input", handleURLChange);

  scanTypeElement.addEventListener("input", handleScanTypeChange);

  emailAddressElement.addEventListener("input", handleEmailChange);

  const observer = new MutationObserver(() => {
    const elements = Array.from(document.getElementsByTagName("p"));
    elements.forEach((e) => {
      if (e.innerText.startsWith("Response ID: ")) {
        document.getElementsByTagName("label")[0].innerHTML =
          "How was your experience with Purple HATS?";
        ipcRenderer.send("userDataFormSubmitted", {websiteURL, scanType, emailAddress});
        websiteURLElement.removeEventListener("input", handleURLChange);
        scanTypeElement.removeEventListener("input", handleScanTypeChange);
        emailAddressElement.removeEventListener("input", handleEmailChange);
        observer.disconnect();
      }
    });
  });

  observer.observe(document.getElementById("root"), {
    subtree: true,
    childList: true,
  });
});