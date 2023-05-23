const { app: electronApp, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const EventEmitter = require("events");
const constants = require("./constants");
const scanManager = require("./scanManager");
const updateManager = require("./updateManager");
const userDataFormManager = require("./userDataFormManager");

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

  updateEvent.on("settingUp", () => {
    launchWindow.webContents.send("launchStatus", "settingUp");
  });

  updateEvent.on("checking", () => {
    launchWindow.webContents.send("launchStatus", "checkingUpdates");
  });

  updateEvent.on("promptUpdate", (userResponse) => {
    launchWindow.webContents.send("launchStatus", "promptUpdate");
    ipcMain.once("proceedUpdate", (_event, response) => {
      userResponse(response);
    });
  });

  updateEvent.on("updating", () => {
    launchWindow.webContents.send("launchStatus", "updatingApp");
  });

  await updateManager.run(updateEvent);

  launchWindow.close();

  const mainReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createMainWindow();
  userDataFormManager.init(mainWindow);
  scanManager.init(mainWindow);
  await mainReady;
  mainWindow.webContents.send("appStatus", "ready");
  mainWindow.webContents.send("versionNumber", constants.appVersion);
});

app.on("quit", () => {
  /* Synchrnously removes file upon quitting the app. Restarts/Shutdowns in
  Windows will not trigger this event */
  if (fs.existsSync(constants.scanResultsPath)){
    fs.rmSync(constants.scanResultsPath, { recursive: true }, err => {
      if (err) {
        console.error(`Error while deleting ${constants.scanResultsPath}.`);
      }
    })
  }
  updateManager.killChildProcess();
  scanManager.killChildProcess();
});
