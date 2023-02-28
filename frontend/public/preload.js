const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("services", {
  startScan: async (scanDetails) => {
    const results = await ipcRenderer.invoke("startScan", scanDetails);
    return results;
  }
});
