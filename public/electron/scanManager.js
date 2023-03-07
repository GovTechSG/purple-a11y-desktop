const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");
const { randomUUID } = require("crypto");
const { backendPath } = require("./constants");
const { silentLogger, consoleLogger } = require("./logs");

const scanHistory = {};

const getScanOptions = (details) => {
  const { scanType, url, customDevice, viewportWidth, maxPages } = details;
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

  return options;
}

const startScan = async (scanDetails) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);

  const response = await new Promise((resolve) => {
    const scan = fork(
      path.join(backendPath, "cli.js"),
      getScanOptions(scanDetails),
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
};

const getReportPath = (scanId) => {
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
};
