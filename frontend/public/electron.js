const { ipcMain } = require("electron");
const electron = require("electron");
const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const backendPath = path.join(__dirname, "..", "backend");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
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
      ["-c", scanType, "-u", url, "-p", "1", "--resultspath"],
      { silent: true, cwd: backendPath }
    );

    scan.on("exit", (code) => {
      const stdout = scan.stdout.read().toString();
      if (code === 0) {
        const resultsPath = stdout
          .split("Results directory is at ")[1]
          .split(" ")[0];
        const reportPath = path.join(
          backendPath,
          resultsPath,
          "reports",
          "report.html"
        );
        const reportHtml = fs.readFileSync(reportPath, { encoding: "utf-8" });
        resolve({ success: true, report: reportHtml });
      } else {
        resolve({ success: false, message: stdout.toString() });
      }
    });
  });

  return response;
});
