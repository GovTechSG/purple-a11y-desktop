const os = require("os");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const axios = require("axios");
const {
  releaseUrl,
  enginePath,
  appDataPath,
  backendPath,
  updateBackupsFolder,
  scanResultsPath,
  customFlowGeneratedScriptsPath,
  phZipPath,
} = require("./constants");
const { silentLogger } = require("./logs");

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const execCommand = async (command) => {
  let options = { cwd: appDataPath };

  if (os.platform() === "win32") {
    command = `$ProgressPreference = 'SilentlyContinue';${command}`;
    options.shell = "powershell.exe";
  }

  const execution = new Promise((resolve) => {
    const process = exec(command, options, (err, _stdout, stderr) => {
      if (err) {
        silentLogger.error(stderr.toString());
      }
      currentChildProcess = null;
      resolve();
    });
    currentChildProcess = process;
  });

  await execution;
};

const getDownloadUrlFromReleaseData = (data) => {
  const osToUrl = {};

  data.assets.forEach((e) => {
    const url = e.browser_download_url;

    if (url.endsWith("windows.zip")) {
      osToUrl.win32 = url;
    } else {
      osToUrl.darwin = url;
    }
  });

  return osToUrl[os.platform()];
};

const backUpData = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `New-Item '${updateBackupsFolder}' -ItemType directory;
    if (Test-Path -Path '${scanResultsPath}') {
      Move-Item '${scanResultsPath}' '${updateBackupsFolder}';
    }
    if (Test-Path -Path '${customFlowGeneratedScriptsPath}') {
      Move-Item '${customFlowGeneratedScriptsPath}' '${updateBackupsFolder}';
    }`;
  } else {
    command = `mkdir '${updateBackupsFolder}' &&
    (mv '${scanResultsPath}' '${updateBackupsFolder}' || true) &&
    (mv '${customFlowGeneratedScriptsPath}' '${updateBackupsFolder}' || true)`;
  }

  await execCommand(command);
};

// only run during updates
const cleanUpBackend = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `Remove-Item '${backendPath}' -Recurse -Force;`;
  } else {
    command = `rm -rf '${backendPath}'`;
  }

  await execCommand(command);
};

const downloadBackend = async () => {
  const { data } = await axios.get(releaseUrl);
  const downloadUrl = getDownloadUrlFromReleaseData(data);

  let command;

  if (os.platform() === "win32") {
    command = `Invoke-WebRequest '${downloadUrl}' -OutFile '${phZipPath}';
    New-Item '${backendPath}' -ItemType directory;
    `;
  } else {
    command = `curl '${downloadUrl}' -o '${phZipPath}' -L &&
    mkdir '${backendPath}'
    `;
  }

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `tar -xf '${phZipPath}' -C '${backendPath}';
    Remove-Item '${phZipPath}';
    if (Test-Path -Path '${updateBackupsFolder}\\*') {
      Move-Item '${updateBackupsFolder}\\*' '${enginePath}';
      Remove-Item -Recurse -Force '${updateBackupsFolder}'
    }
    `;
  } else {
    command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    (mv '${updateBackupsFolder}'/* '${enginePath}' || true) &&
    (rm -rf '${updateBackupsFolder} || true)'
    `;
  }

  await execCommand(command);
};

const isLatestBackendVersion = async () => {
  const { data } = await axios.get(releaseUrl);
  const latestVersion = data.tag_name;
  const engineVersion = require(path.join(enginePath, "package.json")).version;

  return engineVersion === latestVersion;
};

const run = async (updaterEventEmitter) => {
  const processesToRun = [];

  const isInterruptedUpdate = fs.existsSync(updateBackupsFolder);
  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);

  if (isInterruptedUpdate) {
    updaterEventEmitter.emit("updating");
    if (!backendExists) {
      processesToRun.push(downloadBackend, unzipBackendAndCleanUp);
    } else if (phZipExists) {
      processesToRun.push(unzipBackendAndCleanUp);
    } else {
      processesToRun.push(
        cleanUpBackend,
        downloadBackend,
        unzipBackendAndCleanUp
      );
    }
  } else {
    if (!backendExists) {
      updaterEventEmitter.emit("settingUp");
      processesToRun.push(downloadBackend, unzipBackendAndCleanUp);
    } else if (phZipExists) {
      updaterEventEmitter.emit("settingUp");
      processesToRun.push(unzipBackendAndCleanUp);
    } else {
      updaterEventEmitter.emit("checking");
      const isUpdateAvailable = !(await isLatestBackendVersion());
      if (isUpdateAvailable) {
        updaterEventEmitter.emit("updating");
        processesToRun.push(
          backUpData,
          cleanUpBackend,
          downloadBackend,
          unzipBackendAndCleanUp
        );
      }
    }
  }

  for (const proc of processesToRun) {
    await proc();
  }
};

module.exports = {
  killChildProcess,
  run,
};
