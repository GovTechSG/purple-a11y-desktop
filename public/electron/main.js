const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  shell,
  session,
} = require("electron");
const { getDefaultChromeDataDir } = require("./constants")
const os = require("os");
const axios = require("axios");
const https = require("https");
const EventEmitter = require("events");
const constants = require("./constants");
const scanManager = require("./scanManager");
const updateManager = require("./updateManager");
const userDataManager = require("./userDataManager.js");
const showdown = require('showdown');

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
  // mainWindow.loadURL(`http://localhost:3000`)
}

// TODO set ipcMain messages
app.on("ready", async () => {
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      headers: {
        // 'X-Forwarded-For': 'xxx',
        "User-Agent": "axios",
      },
    }),
  });
  
  const { data: releaseInfo } = await axiosInstance.get('https://greyguy21.github.io/purple-hats-desktop/latest-release.json')
  .catch((e) => {
    console.log("Unable to get release info");
    return { data: undefined };
  });

  const {
    latestRelease,
    latestPreRelease,
    latestReleaseNotes,
    latestPreReleaseNotes
  } = releaseInfo ? releaseInfo : {};

  // create settings file if it does not exist
  await userDataManager.init();

  if (constants.proxy === null) {
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

    updateEvent.on("promptFrontendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptFrontendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("promptBackendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptBackendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("updatingFrontend", () => {
      launchWindow.webContents.send("launchStatus", "updatingFrontend");
    });

    updateEvent.on("updatingBackend", () => {
      launchWindow.webContents.send("launchStatus", "updatingBackend");
    });

    updateEvent.on("frontendDownloadComplete", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadComplete");
      ipcMain.once("launchInstaller", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("frontendDownloadCompleteMacOS", (userResponse) => {
      launchWindow.webContents.send(
        "launchStatus",
        "frontendDownloadCompleteMacOS"
      );
      ipcMain.once("restartAppAfterMacOSFrontendUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("installerLaunched", () => {
      app.exit();
    });

    updateEvent.on("restartTriggered", () => {
      app.relaunch();
      app.exit();
    });

    updateEvent.on("frontendDownloadFailed", () => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadFailed");
    });

    await updateManager.run(updateEvent, latestRelease, latestPreRelease);

    launchWindow.close();
  }

  const mainReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createMainWindow();

  const scanEvent = new EventEmitter();
  scanManager.init(scanEvent);
  scanEvent.on("scanningUrl", (url) => {
    mainWindow.webContents.send("scanningUrl", url);
  })
  scanEvent.on("scanningCompleted", () => {
    mainWindow.webContents.send("scanningCompleted");
  })
  
  ipcMain.on("openLink", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('getEngineVersion', () => {
    return constants.getEngineVersion();
  });

  ipcMain.on("restartApp", (_event) => {
    app.relaunch();
    app.exit();
  })
  
  ipcMain.handle("checkChromeExistsOnMac", () => {
    if (os.platform() === 'darwin') {
      return getDefaultChromeDataDir();
    } else {
      return true;
    }
  })

  ipcMain.handle("isWindows", (_event) => constants.isWindows);

  await mainReady;

  mainWindow.webContents.send("appStatus", "ready");

  const markdownToHTML = (converter, md) => {
    const escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return converter.makeHtml(escaped);
  };

  if (releaseInfo) {
    let newestVer = latestPreRelease;
    let newestNotes = latestPreReleaseNotes;

    // handle case where release > prerelease version
    if (constants.versionComparator(latestRelease, latestPreRelease) === 1) {
      newestVer = latestRelease;
      newestNotes = latestReleaseNotes;
    }
    
    const markdownConverter = new showdown.Converter();
    const newestFormattedNotes = markdownToHTML(markdownConverter, newestNotes);
    const latestRelNotes = markdownToHTML(markdownConverter, latestReleaseNotes);

    mainWindow.webContents.send("versionInfo", {
      appVersion: constants.appVersion,
      latestVer: latestRelease,
      latestPrereleaseVer: newestVer,
      latestPreNotes: newestFormattedNotes,
      latestRelNotes,
    });
  } else {
    mainWindow.webContents.send("versionInfo", {
      appVersion: constants.appVersion,
    });
  }
  
  mainWindow.webContents.send("isProxy", constants.proxy);

  const userDataEvent = new EventEmitter();
  userDataEvent.on("userDataDoesNotExist", (setUserData) => {
    mainWindow.webContents.send("userDataExists", "doesNotExist");
    ipcMain.once("userDataReceived", (_event, data) => {
      setUserData(data);
    });
  });
  userDataEvent.on("userDataDoesExist", () => {
    mainWindow.webContents.send("userDataExists", "exists");
  });

  await userDataManager.setData(userDataEvent);

  if (constants.proxy) {
    session.defaultSession.enableNetworkEmulation({
      offline: true,
    });
  }
});

app.on("quit", () => {
  // /* Synchrnously removes file upon quitting the app. Restarts/Shutdowns in
  // Windows will not trigger this event */
  // if (fs.existsSync(constants.scanResultsPath)){
  //   fs.rmSync(constants.scanResultsPath, { recursive: true }, err => {
  //     if (err) {
  //       console.error(`Error while deleting ${constants.scanResultsPath}.`);
  //     }
  //   })
  // }
  updateManager.killChildProcess();
  scanManager.killChildProcess();
});
