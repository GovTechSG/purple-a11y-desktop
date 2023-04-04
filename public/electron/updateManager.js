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

  const execution = new Promise((resolve) => {
    const process = exec(command, options, (err, _stdout, stderr) => {
      if (err) {
        console.log("error with running command:", command)
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
    command = `mkdir "${updateBackupsFolder}" &&\
    move "${scanResultsPath}" "${updateBackupsFolder}" &\
    move "${customFlowGeneratedScriptsPath}" "${updateBackupsFolder}"`
  } else {
    command = `mkdir '${updateBackupsFolder}' &&
    (mv '${scanResultsPath}' '${updateBackupsFolder}' || true) &&
    (mv '${customFlowGeneratedScriptsPath}' '${updateBackupsFolder}' || true)`;
  }

  await execCommand(command);
};


const cleanUpBackend = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `rmdir /s /q "${backendPath}"`;
  } else {
    command = `rm -rf '${backendPath}'`;
  }

  await execCommand(command);
};

const downloadBackend = async () => {
  const { data } = await axios.get(releaseUrl);
  const downloadUrl = getDownloadUrlFromReleaseData(data);

  const command = `curl "${downloadUrl}" -o "${phZipPath}" -L && mkdir "${backendPath}"`;

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `tar -xf "${phZipPath}" -C "${backendPath}" &&\
    del "${phZipPath}" &&\
    (for /D %s in ("${updateBackupsFolder}"\\*) do move "%s" "${enginePath}") &&\
    rmdir /s /q "${updateBackupsFolder}"
    `;
  } else {
    command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    (mv '${updateBackupsFolder}'/* '${enginePath}' || true) &&
    (rm -rf '${updateBackupsFolder}' || true)
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
      let isUpdateAvailable;
      try {
        isUpdateAvailable = !(await isLatestBackendVersion());
      } catch (error) {
        // goes into here when checking of latest backend version fails
        // could be due to internet connectivity issues or github api issues
        // if updates are in fact available, it will be skipped for now and the app will launch
        silentLogger.error(`Could not get lastest version:\n${error}`);
        isUpdateAvailable = false;
      }

      if (isUpdateAvailable) {
        const userResponse = new Promise((resolve) => {
          updaterEventEmitter.emit("promptUpdate", resolve);
        });

        const proceedUpdate = await userResponse;

        if (proceedUpdate) {
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
  }

  for (const proc of processesToRun) {
    await proc();
  }
};

module.exports = {
  killChildProcess,
  run,
};
