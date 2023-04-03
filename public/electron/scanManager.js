const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");
const { randomUUID } = require("crypto");
const { enginePath, nodePath, playwrightBrowsersPath } = require("./constants");

const scanHistory = {};

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const getScanOptions = (details) => {
  const { scanType, url, customDevice, viewportWidth, maxPages, headlessMode } =
    details;
  const options = ["-c", scanType, "-u", url];

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

  return options;
};

const startScan = async (scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(enginePath, "cli.js"),
      getScanOptions(scanDetails),
      {
        silent: true,
        cwd: enginePath,
        env: {
          PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
          PATH: `${process.env.PATH}:${nodePath}`,
        },
      }
    );

    currentChildProcess = scan;
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
      } else if (code === 2) {
        resolve({
          success: false,
          message: "An error has occurred when running the custom flow scan.",
        });
      } else {
        resolve({ success: false, message: stdout });
      }
      currentChildProcess = null;
    });
  });

  return response;
};

const getReportPath = (scanId) => {
  if (scanHistory[scanId]) {
    return path.join(enginePath, scanHistory[scanId], "reports", "report.html");
  }
  return null;
};

const getReportHtml = (scanId) => {
  const reportPath = getReportPath(scanId);
  if (!reportPath) return "";

  const reportHtml = fs.readFileSync(reportPath, { encoding: "utf8" });
  return reportHtml;
};

module.exports = {
  startScan,
  getReportPath,
  getReportHtml,
  killChildProcess,
};
