const os = require("os");
const path = require("path");
const fs = require("fs");
const https = require("https");
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
        console.log("error with running command:", command);
        silentLogger.error(stderr.toString());
      }
      currentChildProcess = null;
      resolve();
    });
    currentChildProcess = process;
  });

  await execution;
};

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    headers: {
      // 'X-Forwarded-For': 'xxx',
      "User-Agent": "axios",
    },
  }),
});

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
    move "${customFlowGeneratedScriptsPath}" "${updateBackupsFolder}"`;
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
  let downloadUrl;

  try {
    const { data } = await axiosInstance.get(releaseUrl);
    downloadUrl = getDownloadUrlFromReleaseData(data);
  } catch (e) {
    console.log(
      "An error occured while trying to check for backend download URL\n",
      e.toString()
    );
    console.log("Attemping to download latest from GitHub directly");

    if (os.platform() === "win32") {
      downloadUrl =
        "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-windows.zip";
    } else {
      downloadUrl =
        "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-mac.zip";
    }
  }

  const command = `curl "${downloadUrl}" -o "${phZipPath}" -L && mkdir "${backendPath}"`;

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `tar -xf "${phZipPath}" -C "${backendPath}" &&\
    del "${phZipPath}" &&\
    (for /D %s in ("${updateBackupsFolder}"\\*) do move "%s" "${enginePath}") &&\
    rmdir /s /q "${updateBackupsFolder}" &&\
    cd "${backendPath}" &&\
    ".\\hats_shell.cmd" echo "Initialise" 
    `;
  } else {
    command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    (mv '${updateBackupsFolder}'/* '${enginePath}' || true) &&
    (rm -rf '${updateBackupsFolder}' || true) &&
    cd '${backendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;
  }

  await execCommand(command);
};

const isLatestBackendVersion = async () => {
  try {
    const engineVersion = require(path.join(
      enginePath,
      "package.json"
    )).version;

    const { data } = await axiosInstance.get(releaseUrl);
    const latestVersion = data.tag_name;

    console.log("Engine version installed: ", engineVersion);
    console.log("Latest version found: ", latestVersion);

    return engineVersion === latestVersion;
  } catch (e) {
    console.log(`Unable to check latest version, skipping\n${e.toString()}`);
    return true;
  }
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
      isUpdateAvailable = !(await isLatestBackendVersion());
      // if fetching of latest backend version from github api fails for any reason,
      // isUpdateAvailable will be set to false so that the app will just launch straightaway
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
