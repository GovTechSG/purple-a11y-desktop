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
  checkChromeExistsOnMac: async () => {
    const chromeExists = await ipcRenderer.invoke("checkChromeExistsOnMac"); 
    return chromeExists;
  },
  startScan: async (scanDetails) => {
    const results = await ipcRenderer.invoke("startScan", scanDetails);
    return results;
  },
  startReplay: async (generatedScript, scanDetails, isReplay) => {
    const results = await ipcRenderer.invoke("startReplay", generatedScript, scanDetails, isReplay); 
    return results;
  },
  generateReport: (customFormLabel, scanId) => {
    ipcRenderer.send("generateReport", customFormLabel, scanId);
  },
  openReport: (scanId) => {
    ipcRenderer.send("openReport", scanId);
  },
  openResultsFolder: (resultsPath) => {
    ipcRenderer.send("openResultsFolder", resultsPath);
  },
  cleanUpCustomFlowScripts: (() => {
    ipcRenderer.send("cleanUpCustomFlowScripts");
  }),
  getResultsFolderPath: async (scanId) => {
    const reportPath = await ipcRenderer.invoke("getResultsFolderPath", scanId);
    return reportPath;
  },
  setExportDir: async () => {
    const exportDir = await ipcRenderer.invoke("setExportDir");
    return exportDir;
  },
  setexclusionsDir: async () => {
    const exclusionsDir = await ipcRenderer.invoke("setexclusionsDir");
    return exclusionsDir;
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
  scanningUrl: (callback) => {
    ipcRenderer.on("scanningUrl", (event, data) => {
      callback(data);
    })
  },
  scanningCompleted: (callback) => {
    ipcRenderer.on("scanningCompleted", () => {
      callback();
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
  mailReport: async (formDetails, scanId) => {
    const response = await ipcRenderer.invoke(
      "mailReport",
      formDetails,
      scanId
    );
    return response;
  },
  getIsWindows: async () => ipcRenderer.invoke("isWindows"),
});
