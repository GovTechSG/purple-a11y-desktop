const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  BrowserView,
} = require("electron");
const fs = require("fs");
const constants = require("./constants");
const scanManager = require("./scanManager");
const updateManager = require("./updateManager");

const app = electronApp;

let launchWindow;
let mainWindow;

function createLaunchWindow() {
  launchWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });

  launchWindow.loadFile(constants.indexPath);
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(constants.indexPath);
}

function createReportWindow(reportPath) {
  let reportWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    parent: mainWindow,
  });
  reportWindow.loadFile(reportPath);
  reportWindow.on("close", () => reportWindow.destroy());
}

function openFormView(url) {
  const view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({
    x: 0.5 * mainWindow.getBounds().width,
    y: 0,
    width: 0.5 * mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
  });
  view.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true,
  });
  view.webContents.loadURL(url);
}

function closeFormView() {
  mainWindow.setBrowserView(null);
}

// TODO set ipcMain messages
app.on("ready", async () => {
  const launchWindowReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createLaunchWindow();
  await launchWindowReady;
  launchWindow.webContents.send("appStatus", "launch");

  if (!fs.existsSync(constants.backendPath)) {
    console.log("backend does not exist. downloading now...");
    launchWindow.webContents.send("launchStatus", "settingUp");
    await updateManager.setUpBackend();
  } else {
    console.log("checking backend version...");
    launchWindow.webContents.send("launchStatus", "checkingUpdates");
    await updateManager
      .checkForBackendUpdates()
      .then(async ({ isLatestVersion, latestDownloadUrl }) => {
        if (!isLatestVersion) {
          console.log("updating backend...");
          launchWindow.webContents.send("launchStatus", "updatingApp");
          await updateManager.updateBackend(latestDownloadUrl);
        }
      })
      .catch((error) =>
        console.log("Error occurred when checking for updates:", error)
      );
  }

  launchWindow.close();

  const mainReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createMainWindow();
  await mainReady;
  mainWindow.webContents.send("appStatus", "ready");
});

ipcMain.handle("startScan", async (_event, scanDetails) => {
  return await scanManager.startScan(scanDetails);
});

ipcMain.on("openReport", (_event, scanId) => {
  const reportPath = scanManager.getReportPath(scanId);
  if (!reportPath) return;
  createReportWindow(reportPath);
});

ipcMain.handle("downloadReport", (_event, scanId) => {
  return scanManager.getReportHtml(scanId);
});

ipcMain.on("openUserDataForm", (_event, url) => {
  openFormView(url);
});

ipcMain.on("closeUserDataForm", (_event) => {
  closeFormView();
});

app.on("quit", () => {
  updateManager.killChildProcess();
  scanManager.killChildProcess();
});
