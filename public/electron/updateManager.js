const os = require("os");
const path = require("path");
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
} = require("./constants");
const { silentLogger } = require("./logs");

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill('SIGKILL');
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
      currentChildProcess = process
      resolve();
    });

    currentChildProcess = null;
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

// only run during updates
const backUpAndCleanUpBackend = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `New-Item '${updateBackupsFolder}' -ItemType directory;
    if (Test-Path -Path '${scanResultsPath}') {
      Move-Item '${scanResultsPath}' '${updateBackupsFolder}';
    }
    if (Test-Path -Path '${customFlowGeneratedScriptsPath}') {
      Move-Item '${customFlowGeneratedScriptsPath}' '${updateBackupsFolder}';
    }
    Remove-Item '${backendPath}' -Recurse -Force;
    `;
  } else {
    command = `mkdir '${updateBackupsFolder}' &&
    ([ -d '${scanResultsPath}' ] && mv '${scanResultsPath}' '${updateBackupsFolder}') |
    ([ -d '${customFlowGeneratedScriptsPath}' ] && mv '${customFlowGeneratedScriptsPath}' '${updateBackupsFolder}') |
    rm -rf '${backendPath}'`;
  }

  await execCommand(command);
};

const downloadBackend = async (downloadUrl) => {
  let command;

  if (os.platform() === "win32") {
    command = `Invoke-WebRequest '${downloadUrl}' -OutFile PHLatest.zip;
    New-Item '${backendPath}' -ItemType directory;
    `;
  } else {
    command = `curl '${downloadUrl}' -o PHLatest.zip -L &&
    mkdir '${backendPath}'
    `;
  }

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `tar -xf PHLatest.zip -C '${backendPath}';
    Remove-Item PHLatest.zip;
    if (Test-Path -Path '${updateBackupsFolder}\\*') {
      Move-Item '${updateBackupsFolder}\\*' '${enginePath}';
      Remove-Item -Recurse -Force '${updateBackupsFolder}'
    }
    `;
  } else {
    command = `tar -xf PHLatest.zip -C '${backendPath}' &&
    rm PHLatest.zip &&
    ([ -d '${updateBackupsFolder}' ] && mv '${updateBackupsFolder}'/* '${enginePath}' | rm -rf '${updateBackupsFolder}')
    `;
  }

  await execCommand(command);
};

const setUpBackend = async () => {
  const { data } = await axios.get(releaseUrl);
  const downloadUrl = getDownloadUrlFromReleaseData(data);

  await downloadBackend(downloadUrl);
  await unzipBackendAndCleanUp();
};

const checkForBackendUpdates = async () => {
  const { data } = await axios.get(releaseUrl);
  const latestVersion = data.tag_name;
  const engineVersion = require(path.join(enginePath, "package.json")).version;

  if (engineVersion === latestVersion) {
    return { isLatestVersion: true };
  }

  return {
    isLatestVersion: false,
    latestDownloadUrl: getDownloadUrlFromReleaseData(data),
  };
};

const updateBackend = async (downloadUrl) => {
  await backUpAndCleanUpBackend();
  await downloadBackend(downloadUrl);
  await unzipBackendAndCleanUp();
};

module.exports = {
  setUpBackend,
  checkForBackendUpdates,
  updateBackend,
  killChildProcess,
};
