const { ipcMain } = require("electron");
const electron = require("electron");
const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");
const { randomUUID } = require('crypto');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const backendPath = path.join(__dirname, "..", "backend");
const scanHistory = {};

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

function getReportPath(scanId) {
  if (scanHistory[scanId]) {
    return path.join(backendPath, scanHistory[scanId], 'reports', 'report.html');
  } 
  return null;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

ipcMain.handle("startScan", async (_event, scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(backendPath, "cli.js"),
      ["-c", scanType, "-u", url, "-p", "1"],
      { silent: true, cwd: backendPath }
    );

    scan.on("exit", (code) => {
      const stdout = scan.stdout.read().toString();
      console.log(stdout);
      if (code === 0) {
        const resultsPath = stdout
          .split("Results directory is at ")[1]
          .split(" ")[0];
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        console.log('scanHistory:', scanHistory);
        resolve({ success: true, scanId });
      } else {
        resolve({ success: false, message: stdout });
      }
    });
  });

  console.log(response.scanId);
  return response;
});

ipcMain.on('openReport', (_event, scanId) => {
  const reportPath = getReportPath(scanId);
  console.log(reportPath);
  if (!reportPath) return;

  let reportWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow
  })
  reportWindow.loadFile(reportPath);

  reportWindow.on('close', () => reportWindow.destroy());
})

ipcMain.handle('downloadReport', (_event, scanId) => {
  const reportPath = getReportPath(scanId);
  if (!reportPath) return "";

  const reportHtml = fs.readFileSync(reportPath, { encoding: 'utf8' });
  return reportHtml;
})