const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("services", {
  getVersionNumber: (callback) => {
    ipcRenderer.on("versionNumber", (event, data) => {
      callback(data);
    });
  },
  startScan: async (scanDetails) => {
    const results = await ipcRenderer.invoke("startScan", scanDetails);
    return results;
  },
  openReport: (scanId) => {
    ipcRenderer.send("openReport", scanId);
  },
  downloadResults: async (scanId) => {
    const reportZip = await ipcRenderer.invoke("downloadResults", scanId);
    return reportZip;
  },
  openUserDataForm: (url) => {
    ipcRenderer.send("openUserDataForm", url);
  },
  closeUserDataForm: (url) => {
    ipcRenderer.send("closeUserDataForm", url);
  },
  guiReady: async () => {
    ipcRenderer.send("guiReady");
  },
  appStatus: (callback) => {
    ipcRenderer.on("appStatus", (event, data) => {
      callback(data);
    });
  },
  launchStatus: (callback) => {
    ipcRenderer.on("launchStatus", (event, data) => {
      callback(data);
    });
  },
  proceedUpdate: (response) => {
    ipcRenderer.send("proceedUpdate", response);
  },
  enableReportDownload: (callback) => {
    ipcRenderer.on("enableReportDownload", () => callback());
  },
  enableMailReport: (callback) => {
    ipcRenderer.on("enableMailReport", (event, formDetails) => {
      callback(formDetails);
    });
  },
  mailReport: async (formDetails, scanId) => {
    const response = await ipcRenderer.invoke(
      "mailReport",
      formDetails,
      scanId
    );
    return response;
  },
  handleRetryOpenForm: (callback) => {
    ipcRenderer.on("retryOpenForm", () => callback());
  },
  handleFormOpenFailure: (callback) => {
    ipcRenderer.on("formOpenFailure", () => callback());
  },
});
