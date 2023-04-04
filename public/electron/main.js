const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  BrowserView,
} = require("electron");
const EventEmitter = require("events");
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

  // this is used for listening to messages that updateManager sends
  const updateEvent = new EventEmitter();
 
  updateEvent.on('settingUp', () => {
    launchWindow.webContents.send("launchStatus", "settingUp");
  })

  updateEvent.on('checking', () => {
    launchWindow.webContents.send("launchStatus", "checkingUpdates");
  })

  updateEvent.on('promptUpdate', (userResponse) => {
    launchWindow.webContents.send("launchStatus", "promptUpdate");
    ipcMain.once("proceedUpdate", (_event, response) => {
      userResponse(response);
    })
  })

  updateEvent.on('updating', () => {
    launchWindow.webContents.send("launchStatus", "updatingApp");
  })

  await updateManager.run(updateEvent);

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
