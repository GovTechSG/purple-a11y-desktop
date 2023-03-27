const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  BrowserView,
} = require("electron");
const fs = require("fs");
const { backendPath, preloadPath, indexPath } = require("./constants");
const { startScan, getReportPath, getReportHtml } = require("./scanManager");
const {
  downloadBackend,
  checkForBackendUpdates,
  updateBackend,
} = require("./updateManager");

const app = electronApp;

let launchWindow;
let mainWindow;

function createLaunchWindow() {
  launchWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    webPreferences: {
      preload: preloadPath,
    },
  });

  launchWindow.loadFile(indexPath);
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: preloadPath,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(indexPath);
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
  createLaunchWindow();
  await new Promise((r) => setTimeout(r, 500));

  if (!fs.existsSync(backendPath)) {
    console.log("backend does not exist. downloading now...");
    launchWindow.webContents.send("appStatus", "settingUp");
    await downloadBackend();
  } else {
    console.log("checking backend version...");
    launchWindow.webContents.send("appStatus", "checkingUpdates");
    const { isLatestVersion, latestDownloadUrl } =
      await checkForBackendUpdates();
    if (!isLatestVersion) {
      console.log("updating backend...");
      launchWindow.webContents.send("appStatus", "updatingApp");
      updateBackend(latestDownloadUrl);
    }
  }

  launchWindow.close();
  createMainWindow();
  await new Promise((r) => setTimeout(r, 500));
  mainWindow.webContents.send("appStatus", "ready");
});

ipcMain.handle("startScan", async (_event, scanDetails) => {
  return await startScan(scanDetails);
});

ipcMain.on("openReport", (_event, scanId) => {
  const reportPath = getReportPath(scanId);
  if (!reportPath) return;
  createReportWindow(reportPath);
});

ipcMain.handle("downloadReport", (_event, scanId) => {
  return getReportHtml(scanId);
});

ipcMain.on("openUserDataForm", (_event, url) => {
  openFormView(url);
});

ipcMain.on("closeUserDataForm", (_event) => {
  closeFormView();
});
