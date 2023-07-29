const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("services", {
  getVersionNumber: (callback) => {
    ipcRenderer.on("versionNumber", (event, data) => {
      callback(data);
    });
  },
  getIsProxy: (callback) => {
    ipcRenderer.on("isProxy", (event, data) => {
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
  openResultsFolder: (resultsPath) => {
    ipcRenderer.send("openResultsFolder", resultsPath);
  },
  getResultsFolderPath: async (scanId) => {
    const reportPath = await ipcRenderer.invoke("getResultsFolderPath", scanId);
    return reportPath;
  },
  submitFormViaBrowser: (formDetails) => {
    ipcRenderer.send("submitFormViaBrowser", formDetails);
  },
  setExportDir: async () => {
    const exportDir = await ipcRenderer.invoke("setExportDir");
    return exportDir;
  },
  submitFormViaBrowser: (formDetails) => {
    ipcRenderer.send("submitFormViaBrowser", formDetails);
  },
  getUserData: async () => {
    const data = await ipcRenderer.invoke("getUserData");
    return data;
  },
  editUserData: async (userData) => {
    ipcRenderer.send("editUserData", userData);
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
  userDataExists: (callback) => {
    ipcRenderer.on("userDataExists", (event, data) => {
      callback(data);
    });
  },
  proceedUpdate: (response) => {
    ipcRenderer.send("proceedUpdate", response);
  },
  launchInstaller: (response) => {
    ipcRenderer.send("launchInstaller", response);
  },
  restartAppAfterMacOSFrontendUpdate: (response) => {
    ipcRenderer.send("restartAppAfterMacOSFrontendUpdate", response);
  },
  setUserData: (data) => {
    ipcRenderer.send("userDataReceived", data);
  },
  enableReportDownload: (callback) => {
    ipcRenderer.on("enableReportDownload", () => callback());
  },
  openLink: (url) => {
    ipcRenderer.send("openLink", url);
  },
});
