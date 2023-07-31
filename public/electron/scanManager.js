const { BrowserWindow, ipcMain } = require("electron");
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

  return options;
};

const startScan = async (scanDetails, scanEvent) => {
  const { scanType, url } = scanDetails;
  console.log(`Starting new ${scanType} scan at ${url}.`);
  console.log(getScanOptions(scanDetails));

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

  const response = await new Promise((resolve) => {
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
    scan.stdout.on("data", (data) => {
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
        const generatedScriptName = data.split('\n')[0];
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
        resolve({ success: true, scanId });
      }

      // Handle live crawling output
      if (data.includes("Electron crawling:")) {
        console.log(data);
        const url = data.split("Electron crawling: ")[1].split(" ")[0];
        console.log(url);
        scanEvent.emit("scanningUrl", url);
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
    const replay = spawn(`node`, [generatedScript], {
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
        console.log(data);
        const url = data.split("Electron crawling: ")[1].trim();
        console.log(url);
        scanEvent.emit("scanningUrl", url);
      }

      if (data.includes("results/")) {
        const resultsPath = data.split(" ").slice(-2)[0].split("/").pop();
        console.log(resultsPath);
        const scanId = randomUUID();
        scanHistory[scanId] = resultsPath;
        replay.kill("SIGKILL");
        currentChildProcess = null;
        await cleanUp(scanHistory[scanId].split('_').slice(0, -1).toString().replaceAll(',', '_'));
        resolve({ success: true, scanId });
      }
    });

    replay.on("close", (code) => {
      if (code !== 0) {
        resolve({ success: false, statusCode: code });
      }
    });
    // const replay = (
    //   generatedScript,
    //   [],
    //   {
    //     silent: true,
    //     cwd: resultsPath,
    //     env: {
    //       ...process.env,
    //       RUNNING_FROM_PH_GUI: true,
    //       ...(useChromium && {
    //         PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
    //       }),
    //       PATH: getPathVariable(),
    //     },
    //   }
    // )

    // replay.on("exit", (code) => {
    //   if (code === 0) {
    //     const stdout = replay.stdout.read().toString().trim();
    //     const scanId = randomUUID();
    //     console.log(stdout.split(" ").slice(-2)[0]);
    //     scanHistory[scanId] = stdout.split(" ").slice(-2)[0].split("/").pop();

    //     // console.log(stdout);
    //     // const currentResultsPath = path.join(
    //     //   enginePath,
    //     //   stdout.split(" ").slice(-2)[0]
    //     // );
    //     // console.log(currentResultsPath);

    //     // // const resultsName = currentResultsPath.split("/").pop();
    //     // // console.log(resultsName);
    //     // const scanId = randomUUID();
    //     // scanHistory[scanId] =  stdout.split(" ").slice(-2)[0];
    //     // const newResultsPath = path.join(
    //     //   resultsPath,
    //     //   scanHistory[scanId]
    //     // );;
    //     // console.log(newResultsPath);

    //     // fs.move(currentResultsPath, newResultsPath, (err) => {
    //     //   if (err) return console.log(err);
    //     //   console.log(success);
    //     // })
    //     // console.log(newResultsPath);

    //     resolve({ success: true, scanId });
    //   } else {
    //     resolve({
    //       success: false,
    //       message: "An error has occurred when running the custom flow scan.",
    //     });
    //   }
    // });
  });

  return response;
  // how to get the scan id :")

  // const replay = fork(
  //   generatedScript,
  //   {
  //     silent: true,
  //     cwd: resultsPath,
  //     env: {
  //       ...process.env,
  //       RUNNING_FROM_PH_GUI: true,
  //       ...(useChromium && {
  //         PLAYWRIGHT_BROWSERS_PATH: `${playwrightBrowsersPath}`,
  //       }),
  //       PATH: getPathVariable(),
  //     },
  //   }
  // );

  // currentChildProcess = replay;

  // replay.on("exit", (code) => {
  //   const stdout = scan.stdout.read().toString().trim();
  //   console.log(stdout);
  // })
  // currentChildProcess = null;
};

const generateReport = (customFlowLabel, scanId) => {
  const currentResultsPath = scanHistory[scanId];
  console.log(currentResultsPath);

  const reportPath = getReportPath(scanId);
  console.log(reportPath);
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
// const getResultsZipPath = (scanId) => {
//   if (scanHistory[scanId]) {
//     return path.join(resultsPath, "a11y-scan-results.zip");
//   }
//   return null;
// };

async function createReportWindow(reportPath) {
  const url = "file://" + reportPath;
  let browser = readUserDataFromFile().browser; 
  const { context, browserChannel, proxy } = await createPlaywrightContext(browser, null, true);

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

const cleanUp = async (folderName, setDefaultFolders = false) => {
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
    await createReportWindow(reportPath);
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
