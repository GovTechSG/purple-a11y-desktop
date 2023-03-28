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
  appStatus: (callback) => {
    ipcRenderer.on("appStatus", (event, data) => {
      callback(data);
    });
  },
  openUserDataForm: (url) => {
    ipcRenderer.send("openUserDataForm", url);
  },
  closeUserDataForm: (url) => {
    ipcRenderer.send("closeUserDataForm", url);
  },
  guiReady: async () => {
    ipcRenderer.send("guiReady");
  }
});
