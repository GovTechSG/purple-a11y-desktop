const os = require("os");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { exec, spawn } = require("child_process");
const axios = require("axios");
const {
  releaseUrl,
  enginePath,
  getEngineVersion,
  getFrontendVersion,
  appPath,
  backendPath,
  frontendPath,
  updateBackupsFolder,
  scanResultsPath,
  phZipPath,
  createPlaywrightContext,
  deleteClonedProfiles,
  artifactInstallerPath,
  resultsPath,
} = require("./constants");
const { silentLogger } = require("./logs");
const { readUserDataFromFile } = require("./userDataManager");

let currentChildProcess;

const killChildProcess = () => {
  if (currentChildProcess) {
    currentChildProcess.kill("SIGKILL");
  }
};

const execCommand = async (command) => {
  let options = { cwd: appPath };

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
    move "${scanResultsPath}" "${updateBackupsFolder}"`;
  } else {
    command = `mkdir '${updateBackupsFolder}' &&
    (mv '${scanResultsPath}' '${updateBackupsFolder}' || true)`;
  }

  await execCommand(command);
};

const cleanUpBackend = async () => {
  let command;

  if (os.platform() === "win32") {
    command = `rmdir /s /q '${backendPath}'`;
  } else {
    command = `rm -rf '${backendPath}'`;
  }

  await execCommand(command);
};

const downloadBackend = async () => {
  if (os.platform() === "win32") {
    return;
  }

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

    // if (os.platform() === "win32") {
    //   downloadUrl =
    //     "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-windows.zip";
    // } else {
    downloadUrl =
      "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-mac.zip";
    //}
  }

  const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && mkdir '${backendPath}'`;

  await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command;

  if (os.platform() === "win32") {
    // command = `tar -xf "${phZipPath}" -C "${backendPath}" &&\
    // del "${phZipPath}" &&\
    command = `cd '${backendPath}' &&\
    ".\\hats_shell.cmd" echo "Initialise" 
    `;
  } else {
    command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    cd '${backendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;
  }

  await execCommand(command);
};

const isLatestBackendVersion = async () => {
  try {
    const { data } = await axiosInstance.get(releaseUrl);

    const latestVersion = data.tag_name;
    const engineVersion = getEngineVersion();

    console.log("Engine version installed: ", engineVersion);
    console.log("Latest version found: ", latestVersion);

    return engineVersion === latestVersion;
  } catch (e) {
    console.log(`Unable to check latest version, skipping\n${e.toString()}`);
    return true;
  }
};

const isLatestFrontendVersion = async () => {
  try {
    const { data } = await axiosInstance.get(
      `https://api.github.com/repos/Georgetxm/purple-hats-desktop/releases/latest`
    );

    const latestVersion = data.tag_name;
    const frontendVersion = getFrontendVersion();

    console.log("Frontend version installed: ", frontendVersion);
    console.log("Latest frontend version found: ", latestVersion);

    return frontendVersion === latestVersion;
  } catch (e) {
    console.log(
      `Unable to check latest frontend version, skipping\n${e.toString()}`
    );
    return true;
  }
};

const downloadFrontend = async () => {
  // const scriptPath = "../../scripts/downloadFrontend.ps1";
  const shellScript = `$artifactUrl = "https://github.com/Georgetxm/purple-hats-desktop/releases/latest/download/test.txt"
  $destinationPath = "${resultsPath}\\test.txt"
  $webClient = New-Object System.Net.WebClient
  $webClient.DownloadFile($artifactUrl, $destinationPath)
  Write-Output "Downloaded latest release from github"`;

  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-Command", shellScript]);
    // const args = [
    //   "-Command",
    //   `Start-Process -Verb RunAs powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"'`,
    // ];

    // const ps = spawn("runas", ["powershell.exe", ...args]);

    ps.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    // Log any errors from the PowerShell script
    ps.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    // Log when the PowerShell process exits
    ps.on("exit", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });

  // return false;
  // const downloadUrl =
  //   "https://github.com/Georgetxm/purple-hats-desktop/releases/latest/download/Purple-Hats-setup.exe";

  // const command = `curl -L '${downloadUrl}' -o "${artifactInstallerPath}"`;

  // try {
  //   await execCommand(command);

  //   return true;
  // } catch (error) {
  //   silentLogger.error(error);
  //   return false;
  // }
};

const spawnPowershellUpdateScript = () => {
  const shellScript = `$executablePath = "C:\\Users\\Xuan Ming\\AppData\\Roaming\\Purple HATS\\Purple-Hats-setup.exe"
  Start-Process -FilePath $executablePath`;

  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-Command", shellScript]);
    // const args = [
    //   "-Command",
    //   `Start-Process -Verb RunAs powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"'`,
    // ];

    // const ps = spawn("runas", ["powershell.exe", ...args]);

    ps.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    // Log any errors from the PowerShell script
    ps.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    // Log when the PowerShell process exits
    ps.on("exit", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });

  // // Spawn a powershell script to update the frontend
  // const updateFrontendProcess = spawn(
  //   "powershell.exe",
  //   [
  //     "-ExecutionPolicy",
  //     "Bypass",
  //     "-File",
  //     "../../scripts/launch-installer.ps1",
  //   ]
  //   // { detached: true, stdio: "ignore", shell: true }
  // );

  // updateFrontendProcess.unref();
};

const run = async (updaterEventEmitter) => {
  const processesToRun = [];

  const isInterruptedUpdate = fs.existsSync(updateBackupsFolder);
  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);

  // If a new tag has been
  if (os.platform() === "win32" && !(await isLatestFrontendVersion())) {
    updaterEventEmitter.emit("checking");
    const userResponse = new Promise((resolve) => {
      updaterEventEmitter.emit("promptFrontendUpdate", resolve);
    });

    const proceedUpdate = await userResponse;

    if (proceedUpdate) {
      // spawnPowershellUpdateScript();
      updaterEventEmitter.emit("updatingFrontend");
      const downloadStatus = await downloadFrontend();

      if (downloadStatus) {
        const launchInstallerResponse = new Promise((resolve) => {
          updaterEventEmitter.emit("frontendDownloadComplete", resolve);
        });

        const proceedLaunchInstaller = await launchInstallerResponse;

        if (proceedLaunchInstaller) {
          const scriptResponseCode = await spawnPowershellUpdateScript();
          if (scriptResponseCode) {
            updaterEventEmitter.emit("installerLaunched");
          }
        } else {
          // TODO: Handle user not wanting to update after download success
        }
      } else {
        updaterEventEmitter.emit("frontendDownloadFailed");
      }
    }

    // spawnPowershellUpdateScript();
  } else {
    if (isInterruptedUpdate) {
      updaterEventEmitter.emit("updatingBackend");
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
        // if (os.platform() === "win32") {
        //   return;
        // }

        updaterEventEmitter.emit("checking");
        let isUpdateAvailable;
        isUpdateAvailable = !(await isLatestBackendVersion());
        // if fetching of latest backend version from github api fails for any reason,
        // isUpdateAvailable will be set to false so that the app will just launch straightaway
        if (isUpdateAvailable) {
          const userResponse = new Promise((resolve) => {
            updaterEventEmitter.emit("promptBackendUpdate", resolve);
          });

          const proceedUpdate = await userResponse;

          if (proceedUpdate) {
            updaterEventEmitter.emit("updatingBackend");
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
  }
};

module.exports = {
  killChildProcess,
  run,
};
