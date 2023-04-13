const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("services", {
  startScan: async (scanDetails) => {
    const results = await ipcRenderer.invoke("startScan", scanDetails);
    return results;
  },
  openReport: (scanId) => {
    ipcRenderer.send("openReport", scanId);
  },
  downloadReport: async (scanId) => {
    const reportHtml = await ipcRenderer.invoke("downloadReport", scanId);
    return reportHtml;
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
});
