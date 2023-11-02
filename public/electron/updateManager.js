const os = require("os");
const path = require("path");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const {
  getEngineVersion,
  getFrontendVersion,
  appPath,
  backendPath,
  phZipPath,
  resultsPath,
  frontendReleaseUrl,
  installerExePath,
  macOSExecutablePath,
  versionComparator,
  macOSPrepackageBackend,
} = require("./constants");
const { silentLogger } = require("./logs");
const { writeUserDetailsToFile, readUserDataFromFile } = require("./userDataManager");

let currentChildProcess;

let engineVersion;
let isLabMode = false;

try {
  engineVersion = getEngineVersion();
} catch (e) {
}

try {
  // to get isLabMode flag from userData.txt to determine version to update to
  const userData = readUserDataFromFile();
  isLabMode = !!userData.isLabMode; // ensure value is a boolean
} catch (e) {
  // unable to read user data, leave isLabMode as false
}

const appFrontendVer = getFrontendVersion();

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

const unzipBackendAndCleanUp = async (zipPath=phZipPath) => {
  let unzipCommand = `mkdir -p '${backendPath}' && tar -xf '${zipPath}' -C '${backendPath}' &&
    rm '${zipPath}' &&
    cd '${backendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;
  // await execCommand(command);

  // return async () => await execCommand(command);
  return async () => {
    await execCommand(unzipCommand);
  }
};

const getLatestFrontendVersion = async (latestRelease, latestPreRelease) => {
  try {
    let verToCompare;
    if (isLabMode) {
      // handle case where latest release ver > latest prerelease version
      verToCompare = versionComparator(latestRelease, latestPreRelease) === 1
        ? latestRelease
        : latestPreRelease;
    } else {
      verToCompare = latestRelease;
    }
    if (versionComparator(appFrontendVer, verToCompare) === -1) {
      return verToCompare;
    }
    return undefined; // no need for update
  } catch (e) {
    console.log(`Unable to check latest frontend version, skipping\n${e.toString()}`);
    return undefined;
  }
};

/**
 * Spawns a PowerShell process to download and unzip the frontend
 * @returns {Promise<boolean>} true if the frontend was downloaded and unzipped successfully, false otherwise
 */
const downloadAndUnzipFrontendWindows = async (tag=undefined) => {
  const downloadUrl = tag 
    ? `https://github.com/GovTechSG/purple-hats-desktop/releases/download/${tag}/purple-hats-desktop-windows.zip`
    : frontendReleaseUrl;
  const shellScript = `
  $webClient = New-Object System.Net.WebClient
  try {
    $webClient.DownloadFile("${downloadUrl}", "${resultsPath}\\purple-hats-desktop-windows.zip")
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
const downloadAndUnzipFrontendMac = async (tag=undefined) => {
  const downloadUrl = tag 
    ? `https://github.com/GovTechSG/purple-hats-desktop/releases/download/${tag}/purple-hats-desktop-macos.zip`
    : frontendReleaseUrl;
  const command = `
  curl -L '${downloadUrl}' -o '${resultsPath}/purple-hats-desktop-mac.zip' &&
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

const downloadBackend = async (tag=undefined) => {
  const downloadUrl = `https://github.com/GovTechSG/purple-hats/releases/download/${tag}/purple-hats-portable-mac.zip`;
  const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && rm -rf '${backendPath}' && mkdir '${backendPath}'`;

  return async () => await execCommand(command);
};

const run = async (updaterEventEmitter, latestRelease, latestPreRelease) => {
  const processesToRun = [];

  updaterEventEmitter.emit("checking");

  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);
  const toUpdateFrontendVer = await getLatestFrontendVersion(latestRelease, latestPreRelease);

  // Auto updates via installer is only applicable for Windows
  // Auto updates for backend on Windows will be done via a powershell script due to %ProgramFiles% permission
  if (os.platform() === "win32") {
    // Frontend update via Installer for Windows
    // Will also update backend as it is packaged in the installer
    if (toUpdateFrontendVer) {
      const userResponse = new Promise((resolve) => {
        updaterEventEmitter.emit("promptFrontendUpdate", resolve);
      });

      const proceedUpdate = await userResponse;

      if (proceedUpdate) {
        updaterEventEmitter.emit("updatingFrontend");
        let isDownloadFrontendSuccess = null;

        try {
          isDownloadFrontendSuccess = await downloadAndUnzipFrontendWindows(toUpdateFrontendVer);
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
      } else {
        if (!backendExists) {
          if (phZipExists) {
            processesToRun.push(await unzipBackendAndCleanUp());
          } else {
            // Trigger download for backend via Github if backend does not exist
            updaterEventEmitter.emit('settingUp');
            await downloadAndUnzipBackendWindows(appFrontendVer);
          }
        }
      }
    }
  } else {
    // user is on mac
    if (toUpdateFrontendVer) {
      const userResponse = new Promise((resolve) => {
        updaterEventEmitter.emit("promptFrontendUpdate", resolve);
      });

      const proceedUpdate = await userResponse;

      if (proceedUpdate) {
        updaterEventEmitter.emit("updatingFrontend");

        // Relaunch the app with new binaries if the frontend update is successful
        // If unsuccessful, the app will be launched with existing frontend
        try {
          await downloadAndUnzipFrontendMac(toUpdateFrontendVer);
          currentChildProcess = null;

          if (fs.existsSync(macOSPrepackageBackend)) {
            await unzipBackendAndCleanUp(macOSPrepackageBackend);
          }

          writeUserDetailsToFile({ firstLaunchOnUpdate: true });
          updaterEventEmitter.emit("restartTriggered");
        } catch (e) {
          silentLogger.error(e.toString());
        }
      } 
    } else {
      if (!backendExists) {
        updaterEventEmitter.emit('settingUp')
        if (fs.existsSync(macOSPrepackageBackend)) {
          // Trigger an unzip from Resources folder if backend does not exist or backend is older
          await unzipBackendAndCleanUp(macOSPrepackageBackend);
        } else {
          processesToRun.push(await downloadBackend(appFrontendVer), await unzipBackendAndCleanUp());
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