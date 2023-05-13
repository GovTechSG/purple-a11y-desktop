const { ipcMain, BrowserView, BrowserWindow } = require("electron");
const constants = require("./constants");
const os = require("os");

let formOpenAttempt = 0;

function openFormView(contextWindow, url) {
  const view = new BrowserView({
    webPreferences: { preload: constants.userDataFormPreloadPath },
  });
  contextWindow.setBrowserView(view);
  view.setBounds({
    x: 0.5 * contextWindow.getBounds().width,
    y: 0,
    width: 0.5 * contextWindow.getBounds().width,
    height: contextWindow.getBounds().height,
  });
  view.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true,
  });
  view.webContents.loadURL(url);
}

function closeFormView(contextWindow) {
  formOpenAttempt = 0;
  contextWindow.setBrowserView(null);
}

/* retries are implemented to handle very rare occurrences where Electron is somehow
unable to process arguments passed into openFormView, which the cause of it has yet
to be determined. 3 retries are performed and if it is still unsuccessful, just
enable report viewing/download */
function init(contextWindow) {
  ipcMain.on("openUserDataForm", async (_event, url) => {
    try {
      formOpenAttempt += 1;
      openFormView(contextWindow, url);
    } catch (error) {
      if (formOpenAttempt <= 3) {
        // wait for 500ms before each retry
        await new Promise((r) => setTimeout(r, 500));
        console.log("Retry form opening...");
        contextWindow.webContents.send("retryOpenForm");
      } else {
        console.log("Could not open the post scan form:\n", error);
        contextWindow.webContents.send("formOpenFailure");
        contextWindow.webContents.send("enableReportDownload");
        closeFormView(contextWindow);
      }
    }
  });

  ipcMain.on("userDataFormSubmitted", (_event, formDetails) => {
    contextWindow.webContents.send("enableReportDownload");
    contextWindow.webContents.send("enableMailReport", formDetails);
    if (os.platform() === "win32") {
    }
  });

  ipcMain.on("closeUserDataForm", () => {
    closeFormView(contextWindow);
  });
}

module.exports = {
  init,
};
