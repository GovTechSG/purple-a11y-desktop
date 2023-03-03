const { ipcMain } = require("electron");
const electron = require("electron");
const fs = require("fs");
const path = require("path");
const { execSync, fork } = require("child_process");
const { randomUUID } = require("crypto");
const axios = require("axios");
const os = require("os");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const releaseUrl =
  "https://api.github.com/repos/GovTechSG/purple-hats/releases/latest";
const backendPath = path.join(__dirname, "..", "backend");
const scanHistory = {};
let mainWindow;

async function downloadBackend() {
  const { data } = await axios.get(releaseUrl);
  let command;
  if (os.platform() === "win32") {
    command = `Invoke-WebRequest "${data.tarball_url}" -OutFile PHLatest.tar.gz;
    New-Item backend -ItemType directory;
    tar -xzf PHLatest.tar.gz -C backend --strip-components=1;
    Remove-Item PHLatest.tar.gz;
    Set-Location backend;
    npm install;
    `;
    execSync(command, { shell: "powershell.exe" });
  } else {
    command = `curl "${data.tarball_url}" -o PHLatest.tar.gz -L &&
    mkdir backend &&
    tar -xzf PHLatest.tar.gz -C backend --strip-components=1 &&
    rm PHLatest.tar.gz &&
    cd backend &&
    npm install`;

    execSync(command);
  }
}

async function checkAndUpdateBackend() {
  const currentVersion = require(path.join(
    backendPath,
    "package.json"
  )).version;
  const { data } = await axios.get(releaseUrl);
  const latestVersion = data.tag_name;

  if (currentVersion === latestVersion) {
    console.log("running latest version of purple hats");
    return;
  }

  console.log("newer version of purple hats found, updating...");

  let command;
  if (os.platform() === "win32") {
    command = `Rename-Item backend backend2;
    Invoke-WebRequest "${data.tarball_url}" -OutFile PHLatest.tar.gz;
    New-Item backend -ItemType directory;
    tar -xzf PHLatest.tar.gz -C backend --strip-components=1; 
    Move-Item backend2/node_modules backend;
    Remove-Item backend2 -Recurse;
    Set-Location backend;
    npm install;
    `;

    execSync(command, { shell: "powershell.exe" });
  } else {
    command = `mv backend backend2 && 
    curl "${data.tarball_url}" -o PHLatest.tar.gz -L &&
    mkdir backend &&
    tar -xzf PHLatest.tar.gz -C backend --strip-components=1 && 
    mv backend2/node_modules backend &&
    rm -r backend2 &&
    rm PHLatest.tar.gz &&
    cd backend && 
    npm install`;
  }

  execSync(command);
}

function createMainWindow() {
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
    return path.join(
      backendPath,
      scanHistory[scanId],
      "reports",
      "report.html"
    );
  }
  return null;
}

app.on("ready", async () => {
  if (!fs.existsSync(backendPath)) {
    console.log("backend does not exist. downloading now...");
    await downloadBackend();
  } else {
    await checkAndUpdateBackend();
  }

  createMainWindow();
});

ipcMain.handle("startScan", async (_event, scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(backendPath, "cli.js"),
      ["-c", scanType, "-u", url, "-p", "1"],
      { silent: true, cwd: backendPath }
    );

    // scan.stdout.on('data', (chunk) => {
    //   console.log(chunk.toString());
    // })

    scan.on("exit", (code) => {
      const stdout = scan.stdout.read().toString();
      if (code === 0) {
        const resultsPath = stdout
          .split("Results directory is at ")[1]
          .split(" ")[0];
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        resolve({ success: true, scanId });
      } else {
        resolve({ success: false, message: stdout });
      }
    });
  });

  return response;
});

ipcMain.on("openReport", (_event, scanId) => {
  const reportPath = getReportPath(scanId);
  if (!reportPath) return;

  let reportWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
  });
  reportWindow.loadFile(reportPath);

  reportWindow.on("close", () => reportWindow.destroy());
});

ipcMain.handle("downloadReport", (_event, scanId) => {
  const reportPath = getReportPath(scanId);
  if (!reportPath) return "";

  const reportHtml = fs.readFileSync(reportPath, { encoding: "utf8" });
  return reportHtml;
});
