const os = require("os");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { exec, spawn } = require("child_process");
const axios = require("axios");
const {
  releaseUrl,
  getEngineVersion,
  getFrontendVersion,
  appPath,
  backendPath,
  updateBackupsFolder,
  scanResultsPath,
  phZipPath,
  resultsPath,
  frontendReleaseUrl,
  installerExePath,
  macOSExecutablePath,
  getMacOSExecutablePath,
  versionComparator,
  allReleasesUrl,
} = require("./constants");
const { silentLogger } = require("./logs");
const { writeUserDetailsToFile } = require("./userDataManager");

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
  command = `mkdir '${updateBackupsFolder}' &&
    (mv '${scanResultsPath}' '${updateBackupsFolder}' || true)`;

  await execCommand(command);
};

const cleanUpBackend = async () => {
  let command;

  command = `rm -rf '${updateBackupsFolder}'`;

  await execCommand(command);
};

const downloadBackend = async (tag=undefined) => {
  if (os.platform() === "win32"){
    return
  }

  let downloadUrl;

  try {
    // based on tag
    const toDownloadReleaseUrl = tag
      ? `https://api.github.com/repos/GovTechSG/purple-hats/releases/tags/${tag}`
      : releaseUrl;
    const { data } = await axiosInstance.get(toDownloadReleaseUrl);
    downloadUrl = getDownloadUrlFromReleaseData(data);
  } catch (e) {
    console.log(
      "An error occured while trying to check for backend download URL\n",
      e.toString()
    );
    console.log("Attemping to download latest from GitHub directly");
    downloadUrl =
      "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-mac.zip";
  }

  // const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && mkdir '${backendPath}'`;
  const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && rm -rf '${backendPath}' && mkdir '${backendPath}'`;

  return async () => await execCommand(command);
};

const unzipBackendAndCleanUp = async () => {
  let command = `tar -xf '${phZipPath}' -C '${backendPath}' &&
    rm '${phZipPath}' &&
    cd '${backendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;
  await execCommand(command);

  command = `cd '${backendPath}' && './hats_shell.sh' npx playwright install webkit`;
  await execCommand(command);
};

const getLatestBackendVersion = async () => {
  try {
    // get all backend releases
    const { data: allReleases } = await axiosInstance.get(allReleasesUrl);
    const { data: frontendRelease } = await axiosInstance.get(
      `https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/latest`
    );
    const frontendReleaseVer = frontendRelease.tag_name;

    const backendExists = fs.existsSync(backendPath);
    console.log(backendExists, 'backendExists', backendPath);
    if (!backendExists) {
      console.log('no engine');
      for (let release of allReleases) {
        const tag = release.tag_name;
        console.log('checking release tag', tag);
        console.log(versionComparator(frontendReleaseVer, tag) === 1);
        if (versionComparator(frontendReleaseVer, tag) === 1) {
          console.log('download backend release', tag);
          return tag;
        }
      }
    }
    
    const engineVersion = getEngineVersion();
    
    console.log('engine', engineVersion, 'frontendReleaseVer', frontendReleaseVer);
    // data sorted in descending order
    for (let release of allReleases) {
      const tag = release.tag_name;
      console.log('checking release tag', tag);
      console.log(versionComparator(frontendReleaseVer, tag) === 1);
      if (!engineVersion) {
        console.log('no engine');
        if (versionComparator(frontendReleaseVer, tag) === 1) {
          console.log('download backend release', tag);
          return tag;
        }
      } else if (versionComparator(frontendReleaseVer, tag) === 1
        && !(versionComparator(engineVersion, tag) === 1)) {
        console.log('found a backend version');
        // frontendReleaseVer >= this release
        // and current engine version is less than this release
        console.log('download backend release', tag);
        return tag;
      }
    }
    console.log("no need for update");
    return undefined;
  } catch (e) {
    console.log(`Unable to check latest version, skipping\n${e.toString()}`);
    return undefined;
  }
};

const isLatestBackendVersion = async () => {
  try {
    const { data } = await axiosInstance.get(releaseUrl);

    const latestVersion = data.tag_name;
    const engineVersion = getEngineVersion();

    console.log("Engine version installed: ", engineVersion);
    console.log("Latest version found: ", latestVersion);

    return versionComparator(engineVersion, latestVersion) === 1;
  } catch (e) {
    console.log(`Unable to check latest version, skipping\n${e.toString()}`);
    return true;
  }
};

const isLatestFrontendVersion = async () => {
  try {
    const { data } = await axiosInstance.get(
      `https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/latest`
    );

    const latestVersion = data.tag_name;
    const frontendVersion = getFrontendVersion();
    console.log("Frontend version installed: ", frontendVersion);
    console.log("Latest frontend version found: ", latestVersion);

    return versionComparator(frontendVersion, latestVersion) === 1;
  } catch (e) {
    console.log(
      `Unable to check latest frontend version, skipping\n${e.toString()}`
    );
    return true;
  }
};

/**
 * Spawns a PowerShell process to download and unzip the frontend
 * @returns {Promise<boolean>} true if the frontend was downloaded and unzipped successfully, false otherwise
 */
const downloadAndUnzipFrontendWindows = async () => {
  const shellScript = `
  $webClient = New-Object System.Net.WebClient
  try {
    $webClient.DownloadFile("${frontendReleaseUrl}", "${resultsPath}\\purple-hats-desktop-windows.zip")
  } catch {
    Write-Host "Error: Unable to download frontend"
    throw "Unable to download frontend"
    exit 1
  }

  try {
    Expand-Archive -Path "${resultsPath}\\purple-hats-desktop-windows.zip" -DestinationPath "${resultsPath}\\purple-hats-desktop-windows" -Force
  } catch {
    Write-Host "Error: Unable to unzip frontend"
    throw "Unable to unzip frontend"
    exit 2
  }`;

  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-Command", shellScript]);
    currentChildProcess = ps;

    ps.stdout.on("data", (data) => {
      silentLogger.log(data.toString());
    });

    // Log any errors from the PowerShell script
    ps.stderr.on("data", (data) => {
      silentLogger.error(data.toString());
      currentChildProcess = null;
      reject(new Error(data.toString()));
      resolve(false);
    });

    ps.on("exit", (code) => {
      currentChildProcess = null;
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(code.toString()));
        resolve(false);
      }
    });
  });
};

/**
 * Spawns a Shell Command process to download and unzip the frontend
 */
const downloadAndUnzipFrontendMac = async () => {
  const command = `
  curl -L '${frontendReleaseUrl}' -o '${resultsPath}/purple-hats-desktop-mac.zip' &&
  mv '${macOSExecutablePath}' '${path.join(
    macOSExecutablePath,
    ".."
  )}/Purple Hats Old.app' &&
  ditto -xk '${resultsPath}/purple-hats-desktop-mac.zip' '${path.join(
    macOSExecutablePath,
    ".."
  )}' &&
  rm '${resultsPath}/purple-hats-desktop-mac.zip' &&
  rm -rf '${path.join(macOSExecutablePath, "..")}/Purple Hats Old.app' &&
  xattr -rd com.apple.quarantine '${path.join(macOSExecutablePath, "..")}/Purple HATS.app' `;

  await execCommand(command);

};

/**
 * Spawn a PowerShell process to launch the InnoSetup installer executable, which contains the frontend and backend
 * upon confirmation from the user, the installer will be launched & Electron will exit
 * @returns {Promise<boolean>} true if the installer executable was launched successfully, false otherwise
 */
const spawnScriptToLaunchInstaller = () => {
  const shellScript = `Start-Process -FilePath "${installerExePath}"`;

  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-Command", shellScript]);
    currentChildProcess = ps;

    ps.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    ps.stderr.on("data", (data) => {
      currentChildProcess = null;
      console.error(data.toString());
    });

    ps.on("exit", (code) => {
      currentChildProcess = null;
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

/**
 * Spawns a powershell child_process which then runs a powershell script with admin priviledges
 * This will cause a pop-up on the user's ends
 */
const downloadAndUnzipBackendWindows = async (tag=undefined) => {
  const scriptPath = path.join(
    __dirname,
    "..",
    "..",
    "scripts",
    "downloadAndUnzipBackend.ps1"
  );
  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      tag, // release tag to download
    ]); // Log any output from the PowerShell script

    currentChildProcess = ps;

    ps.stdout.on("data", (data) => {
      silentLogger.log(data.toString());
      console.log(data.toString());
    });

    // Log any errors from the PowerShell script
    ps.stderr.on("data", (data) => {
      silentLogger.log(data.toString());
      console.error(data.toString());
      currentChildProcess = null;
      resolve(false);
    });

    ps.on("exit", (code) => {
      currentChildProcess = null;
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const run = async (updaterEventEmitter) => {
  const processesToRun = [];

  const isInterruptedUpdate = fs.existsSync(updateBackupsFolder);
  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);

  updaterEventEmitter.emit("checking");
  const toUpdateBackendVer = await getLatestBackendVersion();
  console.log(toUpdateBackendVer, 'toUpdateBackendVer');

  // Auto updates via installer is only applicable for Windows
  // Auto updates for backend on Windows will be done via a powershell script due to %ProgramFiles% permission
  if (os.platform() === "win32") {
    // Frontend update via Installer for Windows
    // Will also update backend as it is packaged in the installer
    if (!(await isLatestFrontendVersion())) {
      // updaterEventEmitter.emit("checking");
      const userResponse = new Promise((resolve) => {
        updaterEventEmitter.emit("promptFrontendUpdate", resolve);
      });

      const proceedUpdate = await userResponse;

      if (proceedUpdate) {
        updaterEventEmitter.emit("updatingFrontend");
        let isDownloadFrontendSuccess = null;

        try {
          isDownloadFrontendSuccess = await downloadAndUnzipFrontendWindows();
        } catch (e) {
          silentLogger.error(e.toString());
        }

        if (isDownloadFrontendSuccess) {
          const launchInstallerPrompt = new Promise((resolve) => {
            updaterEventEmitter.emit("frontendDownloadComplete", resolve);
          });

          const proceedInstall = await launchInstallerPrompt;

          if (proceedInstall) {
            const isInstallerScriptLaunched =
              await spawnScriptToLaunchInstaller();
            if (isInstallerScriptLaunched) {
              writeUserDetailsToFile({ firstLaunchOnUpdate: true });
              updaterEventEmitter.emit("installerLaunched");
            }
          }
        } else {
          updaterEventEmitter.emit("frontendDownloadFailed");
        }
      }
    }
    // Backend update via GitHub for Windows
    else if (toUpdateBackendVer) {
    // else if (!(await isLatestBackendVersion())) {
      // updaterEventEmitter.emit("checking");
      const userResponse = new Promise((resolve) => {
        updaterEventEmitter.emit("promptBackendUpdate", resolve);
      });

      const proceedUpdate = await userResponse;

      if (proceedUpdate) {
        updaterEventEmitter.emit("updatingBackend");
        await downloadAndUnzipBackendWindows(toUpdateBackendVer);
      }
    }
  } else {
    if (!(await isLatestFrontendVersion())) {
      // updaterEventEmitter.emit("checking");
      const userResponse = new Promise((resolve) => {
        updaterEventEmitter.emit("promptFrontendUpdate", resolve);
      });

      const proceedUpdate = await userResponse;

      if (proceedUpdate) {
        updaterEventEmitter.emit("updatingFrontend");

        // Relaunch the app with new binaries if the frontend update is successful
        // If unsuccessful, the app will be launched with existing frontend
        try {
          await downloadAndUnzipFrontendMac();
          currentChildProcess = null;

          writeUserDetailsToFile({ firstLaunchOnUpdate: true });
          updaterEventEmitter.emit("restartTriggered");
        } catch (e) {
          silentLogger.error(e.toString());
        }
      }
    }

    if (isInterruptedUpdate && toUpdateBackendVer) {
      updaterEventEmitter.emit("updatingBackend");
      if (!backendExists) {
        processesToRun.push(await downloadBackend(toUpdateBackendVer), unzipBackendAndCleanUp);
      } else if (phZipExists) {
        processesToRun.push(unzipBackendAndCleanUp);
      } else {
        processesToRun.push(
          cleanUpBackend,
          await downloadBackend(toUpdateBackendVer),
          unzipBackendAndCleanUp
        );
      }
    } else {
      if (!backendExists && toUpdateBackendVer) {
        updaterEventEmitter.emit("settingUp");
        processesToRun.push(await downloadBackend(toUpdateBackendVer), unzipBackendAndCleanUp);
      } else if (phZipExists) {
        updaterEventEmitter.emit("settingUp");
        processesToRun.push(unzipBackendAndCleanUp);
      } else {
        // updaterEventEmitter.emit("checking");
        // let isUpdateAvailable;
        // isUpdateAvailable = !(await isLatestBackendVersion());

        // if fetching of latest backend version from github api fails for any reason,
        // isUpdateAvailable will be set to false so that the app will just launch straightaway

        // if fetching of latest backend version from github api fails for any reason,
        // toUpdateBackendVer will be undefined so that the app will just launch straightaway
        // if (isUpdateAvailable) {
        if (toUpdateBackendVer) {
          const userResponse = new Promise((resolve) => {
            updaterEventEmitter.emit("promptBackendUpdate", resolve);
          });

          const proceedUpdate = await userResponse;

          if (proceedUpdate) {
            updaterEventEmitter.emit("updatingBackend");
            processesToRun.push(
              backUpData,
              cleanUpBackend,
              await downloadBackend(toUpdateBackendVer),
              unzipBackendAndCleanUp
            );
          }
        }
      }
    }

    for (const proc of processesToRun) {
      console.log(proc);
      await proc();
    }
  }
};

module.exports = {
  killChildProcess,
  run,
};