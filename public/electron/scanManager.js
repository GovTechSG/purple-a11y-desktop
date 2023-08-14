const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");
const os = require("os");
const { randomUUID } = require("crypto");
const {
  enginePath,
  getPathVariable,
  customFlowGeneratedScriptsPath,
  playwrightBrowsersPath,
  resultsPath,
  createPlaywrightContext,
  deleteClonedProfiles,
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

  if (maxConcurrency) {
    options.push("-t", 1);
  }

  if (falsePositive) {
    options.push("-f", "true");
  }

  return options;
};

const startScan = async (scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);
  console.log(getScanOptions(scanDetails));

  const userData = readUserDataFromFile();

  if (userData) {
    scanDetails.email = userData.email;
    scanDetails.name = userData.name;
  }

  let useChromium = false;
  if (
    scanDetails.browser === browserTypes.chromium ||
    (!getDefaultChromeDataDir() && !getDefaultEdgeDataDir())
  ) {
    useChromium = true;
  }

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(enginePath, "cli.js"),
      getScanOptions(scanDetails),
      {
        silent: true,
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

    scan.on("exit", (code) => {
      const stdout = scan.stdout.read().toString().trim();
      if (code === 0) {
        // Output from combine.js which prints the string "No pages were scanned" if crawled URL <= 0
        if (stdout.includes("No pages were scanned")) {
          resolve({ success: false });
        }

        const resultsPath = stdout
          .split("Results directory is at ")[1]
          .split(" ")[0];
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        resolve({ success: true, scanId });
      } else if (code === 2) {
        resolve({
          success: false,
          message: "An error has occurred when running the custom flow scan.",
        });
      } else {
        resolve({ success: false, statusCode: code, message: stdout });
      }
      currentChildProcess = null;

      if (fs.existsSync(customFlowGeneratedScriptsPath)) {
        fs.rm(customFlowGeneratedScriptsPath, { recursive: true }, (err) => {
          if (err) {
            console.error(
              `Error while deleting ${customFlowGeneratedScriptsPath}.`
            );
          }
        });
      }
    });
  });

  return response;
};

const getReportPath = (scanId) => {
  if (scanHistory[scanId]) {
    return path.join(
      resultsPath,
      scanHistory[scanId],
      "reports",
      "report.html"
    );
  }
  return null;
};

const getResultsZipPath = (scanId) => {
  if (scanHistory[scanId]) {
    return path.join(resultsPath, "a11y-scan-results.zip");
  }
  return null;
};

const getResultsZip = (scanId) => {
  const resultsZipPath = getResultsZipPath(scanId);
  if (!resultsZipPath) return "";

  const reportZip = fs.readFileSync(resultsZipPath);
  return reportZip;
};

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

const init = () => {
  ipcMain.handle("startScan", async (_event, scanDetails) => {
    return await startScan(scanDetails);
  });

  ipcMain.on("openReport", async (_event, scanId) => {
    const reportPath = getReportPath(scanId);
    if (!reportPath) return;
    await createReportWindow(reportPath);
  });

  ipcMain.handle("downloadResults", (_event, scanId) => {
    return getResultsZip(scanId);
  });
};

module.exports = {
  init,
  killChildProcess,
};
