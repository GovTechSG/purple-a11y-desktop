const { BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { fork, spawn } = require("child_process");
const fs = require("fs-extra");
const os = require("os");
const { randomUUID } = require("crypto");
const {
  enginePath,
  getPathVariable,
  customFlowGeneratedScriptsPath,
  playwrightBrowsersPath,
  resultsPath,
  scanResultsPath,
  createPlaywrightContext,
  deleteClonedProfiles,
  backendPath,
} = require("./constants");
const {
  browserTypes,
  getDefaultChromeDataDir,
  getDefaultEdgeDataDir,
} = require("./constants");
const { env, report } = require("process");
const { readUserDataFromFile } = require("./userDataManager");
const scanHistory = {};

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const getScanOptions = (details) => {
  const {
    scanType,
    url,
    customDevice,
    viewportWidth,
    maxPages,
    headlessMode,
    browser,
    email,
    name,
    exportDir,
    maxConcurrency,
    falsePositive
  } = details;
  const options = ["-c", scanType, "-u", url, "-k", `${name}:${email}`];

  if (customDevice) {
    options.push("-d", customDevice);
  }

  if (viewportWidth) {
    options.push("-w", viewportWidth);
  }

  if (maxPages) {
    options.push("-p", maxPages);
  }

  if (!headlessMode) {
    options.push("-h", "no");
  }

  if (browser) {
    options.push("-b", browser);
  }

  if (exportDir) {
    options.push("-e", exportDir);
  }

  if (maxConcurrency) {
    options.push("-t", 1);
  }

  if (maxConcurrency) {
    options.push("-t", 1);
  }

  if (falsePositive) {
    options.push("-f", "true");
  }

  return options;
};

const startScan = async (scanDetails, scanEvent) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  const userData = readUserDataFromFile();

  if (userData) {
    scanDetails.email = userData.email;
    scanDetails.name = userData.name;
    scanDetails.exportDir = userData.exportDir;
  }

  let useChromium = false;
  if (
    scanDetails.browser === browserTypes.chromium ||
    (!getDefaultChromeDataDir() && !getDefaultEdgeDataDir())
  ) {
    useChromium = true;
  }

  const response = await new Promise(async (resolve) => {
    const scan = spawn(
      `node`,
      [path.join(enginePath, "cli.js"), ...getScanOptions(scanDetails)],
      {
        cwd: resultsPath,
        env: {
          ...process.env,
          RUNNING_FROM_PH_GUI: true,
          ...(useChromium && {
            PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
          }),
          PATH: getPathVariable(),
        },
      }
    );

    currentChildProcess = scan;

    scan.stderr.setEncoding("utf8");
    scan.stderr.on("data", function (data) {
      console.log("stderr: " + data);
    });

    scan.stdout.setEncoding("utf8");
    scan.stdout.on("data", async (data) => {
      /** Code 0 handled indirectly here (i.e. successful process run),
      as unable to get stdout on close event after changing to spawn from fork */

      // Output from combine.js which prints the string "No pages were scanned" if crawled URL <= 0
      // consider this as successful that the process ran,
      // but failure in the sense that no pages were scanned so that we can display a message to the user
      if (data.includes("No pages were scanned")) {
        scan.kill("SIGKILL");
        currentChildProcess = null;
        resolve({ success: false });
      }

      if (scanDetails.scanType === 'custom' && data.includes('generatedScript')) {
        const generatedScriptName = data.trim();
        console.log('generated script: ', generatedScriptName);
        const generatedScript = path.join(customFlowGeneratedScriptsPath, generatedScriptName);
        resolve({ success: true, generatedScript: generatedScript});
      }

      // The true success where the process ran and pages were scanned
      if (data.includes("Results directory is at")) {
        console.log(data);
        const resultsPath = data
          .split("Results directory is at ")[1]
          .split("/")
          .pop()
          .split(" ")[0];
        console.log(resultsPath);
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        scan.kill("SIGKILL");
        currentChildProcess = null;
        await cleanUp(scanId);
        resolve({ success: true, scanId });
      }

      // Handle live crawling output
      if (data.includes("Electron crawling")) {
        const urlScannedNum = parseInt(data.split("::")[1].trim());
        const status = data.split("::")[2].trim();
        const url = data.split("::")[3].trim();
        console.log(urlScannedNum, ": ", status, ": ", url);
        scanEvent.emit("scanningUrl", {status, url, urlScannedNum});
      }

      if (data.includes("Starting scan")) {
        console.log(data);
      }

      if (data.includes("Electron scan completed")) {
        console.log(data);
        scanEvent.emit("scanningCompleted");
      }
    });

    // Only handles error code closes (i.e. code > 0)
    // as successful resolves are handled above
    scan.on("close", (code) => {
      if (code !== 0) {
        resolve({ success: false, statusCode: code });
      }
      currentChildProcess = null;
    });
  });

  return response;
};

const startReplay = async (generatedScript, scanDetails, scanEvent) => {
  let useChromium = false;
  if (
    scanDetails.browser === browserTypes.chromium ||
    (!getDefaultChromeDataDir() && !getDefaultEdgeDataDir())
  ) {
    useChromium = true;
  }

  const response = await new Promise((resolve, reject) => {
    const replay = spawn(`node`, [path.join(enginePath, "runCustomFlowFromGUI.js"), generatedScript], {
      cwd: resultsPath,
      env: {
        ...process.env,
        RUNNING_FROM_PH_GUI: true,
        ...(useChromium && {
          PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
        }),
        PATH: getPathVariable(),
      },
    });

    currentChildProcess = replay;

    replay.stderr.setEncoding("utf8");
    replay.stderr.on("data", function (data) {
      console.log("stderr: " + data);
    });

    replay.stdout.setEncoding("utf8");
    replay.stdout.on("data", async (data) => {
      if (data.includes("An error has occurred when running the custom flow scan.")) {
        replay.kill("SIGKILL");
        currentChildProcess = null;
        resolve({ success: false });
      }

      // Handle live crawling output
      if (data.includes("Electron crawling:")) {
        const urlScannedNum = parseInt(data.split("::")[1].trim());
        const status = data.split("::")[2].trim();
        const url = data.split("::")[3].trim();
        console.log(urlScannedNum, ":", status, ":", url);
        scanEvent.emit("scanningUrl", {status, url, urlScannedNum});
      }

      if (data.includes("Electron scan completed")) {
        scanEvent.emit("scanningCompleted");
      }

      if (data.includes("results/")) {
        console.log(data);
        const resultsFolderName = data.split(" ").slice(-2)[0].split("/").pop();
        console.log(resultsFolderName);

        const scanId = randomUUID();
        scanHistory[scanId] = resultsFolderName;

        moveCustomFlowResultsToExportDir(scanId, resultsFolderName);
        replay.kill("SIGKILL");
        currentChildProcess = null;
        await cleanUp(scanId);
        resolve({ success: true, scanId });
      }
    });

    replay.on("close", (code) => {
      if (code !== 0) {
        resolve({ success: false, statusCode: code });
      }
    });
  });

  return response;
};

const generateReport = (customFlowLabel, scanId) => {
  const reportPath = getReportPath(scanId);
  const data = fs.readFileSync(reportPath, { encoding: "utf-8" });
  const result = data.replaceAll(/Custom Flow/g, customFlowLabel);
  fs.writeFileSync(reportPath, result);
};

const getReportPath = (scanId) => {
  const resultsFolderPath = getResultsFolderPath(scanId);
  if (scanHistory[scanId]) {
    return path.join(
      resultsFolderPath,
      "reports",
      "report.html"
    );
  }
  return null;
};

const getResultsFolderPath = (scanId) => {
  const exportDir = readUserDataFromFile().exportDir; 
  return path.join(
    exportDir,
    scanHistory[scanId]
  )
}

async function createReportWindow(reportPath) {
  const url = "file://" + reportPath;
  let browser = readUserDataFromFile().browser;
  const { context, browserChannel, proxy } = await createPlaywrightContext(
    browser,
    null,
    true
  );

  const page = await context.newPage();
  await page.goto(url, {
    ...(proxy && { waitUntil: "networkidle" }),
  });

  page.on("close", async (data) => {
    await context.close();
    deleteClonedProfiles(browserChannel);
  });
}

const cleanUp = async (scanId, setDefaultFolders = false) => {
  const folderName = scanHistory[scanId].split('_').slice(0, -1).toString().replaceAll(',', '_'); 
  const pathToDelete = path.join(resultsPath, folderName);
  await fs.pathExists(pathToDelete).then(exists => {
    if (exists) {
      fs.removeSync(pathToDelete);
    }
  });

  if (fs.existsSync(customFlowGeneratedScriptsPath)) {
    fs.rm(customFlowGeneratedScriptsPath, { recursive: true }, (err) => {
      if (err) {
        console.error(
          `Error while deleting ${customFlowGeneratedScriptsPath}.`
        );
      }
    });
  }
};

const moveCustomFlowResultsToExportDir = (scanId, resultsFolderName) => {
  const currentResultsPath = path.join(scanResultsPath, resultsFolderName);
  const newResultsPath = getResultsFolderPath(scanId);

  fs.move(currentResultsPath, newResultsPath, (err) => {
    if (err) return console.log(err);
  })
}

const init = (scanEvent) => {
  ipcMain.handle("startScan", async (_event, scanDetails) => {
    return await startScan(scanDetails, scanEvent);
  });

  ipcMain.handle("startReplay", async (_event, generatedScript, scanDetails) => {
    return await startReplay(generatedScript, scanDetails, scanEvent);
  })

  ipcMain.on("generateReport", (_event, customFlowLabel, scanId) => {
    return generateReport(customFlowLabel, scanId);
  });

  ipcMain.on("openReport", async (_event, scanId) => {
    const reportPath = getReportPath(scanId);
    if (!reportPath) return;
    shell.openExternal(`file://${reportPath}`);
  });

  ipcMain.handle("getResultsFolderPath", async (_event, scanId) => {
    const resultsPath = getResultsFolderPath(scanId);
    return resultsPath;
  })

  // ipcMain.handle("downloadResults", (_event, scanId) => {
  //   return getResultsZip(scanId);
  // });
};

module.exports = {
  init,
  killChildProcess,
};
