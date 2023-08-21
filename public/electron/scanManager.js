const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { fork, spawn } = require("child_process");
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
    falsePositive,
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

const mailResults = async (formDetails, scanId) => {
  const reportPath = getReportPath(scanId);
  const { subject, name, emailAddresses } = formDetails;

  const shellCommand = `
    if ((Split-Path -Path $pwd -Leaf) -eq "scripts") {
      cd ..
    }

    $attachmentCount = 0

    #Get an Outlook application object
    $wasOutlookOpened = $true
    try {
      $o = [System.Runtime.InteropServices.Marshal]::GetActiveObject('Outlook.Application')
    } catch {
      # Outlook is not open, create a new instance
      $o = New-Object -ComObject Outlook.Application
      $wasOutlookOpened = $false
    }

    if ($null -eq $o) {
      throw "Unable to open outlook"
      exit
    }

    $mail = $o.CreateItem(0)

    $mail.subject = "${subject}"

    $mail.body = "Hi ${name},

Please see the attached accessibility scan results with Purple HATS (report.html).
Feel free to reach us at accessibility@tech.gov.sg if you have any questions.

Thank you.
Accessibility Enabling Team"


    $mail.To = "${emailAddresses}"

    $mail.cc = "<accessibility@tech.gov.sg>"

    # # Iterate over all files and only add the ones that have an .html extension
    $files = Get-ChildItem '${reportPath}'

    for ($i = 0; $i -lt $files.Count; $i++) {
      $outfileName = $files[$i].FullName
      $outfileNameExtension = $files[$i].Extension

      if ($outfileNameExtension -eq ".html") {
          $mail.Attachments.Add($outfileName);
          $attachmentCount++
      }
    }

    if ($attachmentCount -eq 0) {
      throw "No files were found in the specified folder. Exiting."
      $o.Quit()
      exit
    }

    $mail.Send()

    # give time to send the email
    Start-Sleep -Seconds 5

    # quit Outlook only if previously not opened
    if ($wasOutlookOpened -eq $false) {
      $o.Quit()
    }

    #end the script
    exit
  `;

  const response = await new Promise((resolve) => {
    const mailProcess = spawn("powershell.exe", [
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      shellCommand,
    ]);

    mailProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      resolve({
        success: false,
        message: `An error has occurred when sending the email: ${data}`,
      });
    });

    mailProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        mailProcess.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
          resolve({
            success: false,
            message: `An error has occurred when sending the email: ${data}`,
          });
        });
      }
    });
  });

  return response;
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

  ipcMain.handle("mailReport", (_event, formDetails, scanId) => {
    return mailResults(formDetails, scanId);
  });
};

module.exports = {
  init,
  killChildProcess,
};
