const os = require("os");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
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
  hashPath,
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
    const process = exec(command, options, (err, stdout, stderr) => {
      if (err) {
        console.log("error with running command:", command);
        silentLogger.error(stderr.toString());
      }
      currentChildProcess = null;
      resolve(stdout);
    });
    currentChildProcess = process;
  });

  return await execution;
};

// get hash value of prepackage zip
const hashPrepackage = async (prepackagePath) => {
  const zipFileReadStream = fs.createReadStream(prepackagePath);
  return new Promise((resolve) => {
    const hash = crypto.createHash("sha256");
    zipFileReadStream.on("data", (data) => {
      hash.update(data);
    });
    zipFileReadStream.on("end", () => {
      const computedHash = hash.digest("hex");
      resolve(computedHash);
    });
  })
};

// unzip backend zip for mac
const unzipBackendAndCleanUp = async (zipPath=phZipPath) => {
  const tempBackendPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Purple HATS",
    "Purple HATS Backend");
  let unzipCommand = `mkdir -p '${tempBackendPath}' && tar -xf '${zipPath}' -C '${tempBackendPath}' &&
    cd '${tempBackendPath}' &&
    './hats_shell.sh' echo "Initialise"
    `;

  return async () => {
    await execCommand(unzipCommand);
  }
};

const getLatestFrontendVersion = (latestRelease, latestPreRelease) => {
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
    return verToCompare;
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
    ? `https://github.com/GovTechSG/purple-a11y-desktop/releases/download/${tag}/purple-a11y-desktop-windows.zip`
    : frontendReleaseUrl;
  const tempResultsPath = path.join(process.env.APPDATA, "Purple A11y");
  const shellScript = `
  $webClient = New-Object System.Net.WebClient
  try {
    If (!(Test-Path -Path "${tempResultsPath}")) {
	New-Item -ItemType Directory -Path "${tempResultsPath}"
    }
    $webClient.DownloadFile("${downloadUrl}", "${tempResultsPath}\\purple-a11y-desktop-windows.zip")
  } catch {
    Write-Host "Error: Unable to download frontend"
    throw "Unable to download frontend"
    exit 1
  }

  try {
    Expand-Archive -Path "${tempResultsPath}\\purple-a11y-desktop-windows.zip" -DestinationPath "${tempResultsPath}\\purple-a11y-desktop-windows" -Force
  } catch {
    Write-Host "Error: Unable to unzip frontend"
    throw "Unable to unzip frontend"
    exit 2
  }`;

  return new Promise((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-Command", shellScript]);
    currentChildProcess = ps;

    ps.stdout.on("data", (data) => {
      silentLogger.debug(data.toString());
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
 * Spawns a Shell Command process to make Purple A11y directory and copy over userData.txt
 */
const createNewAppDir = async (appDirPath) => {
  const oldUserDataPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Purple HATS",
    "userData.txt",
  );
  const command = `
    mkdir -p '${appDirPath}' && 
    [ -f '${oldUserDataPath}' ] && cp '${oldUserDataPath}' '${appDirPath}'
  `

  await execCommand(command);
};

/**
 * Spawns a Shell Command process to download and unzip the frontend
 */
const downloadAndUnzipFrontendMac = async (tag=undefined) => {
  const downloadUrl = tag 
    ? `https://github.com/GovTechSG/purple-a11y-desktop/releases/download/${tag}/purple-a11y-desktop-macos.zip`
    : frontendReleaseUrl;
  const tempResultsPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Purple A11y"
  )

  await createNewAppDir(tempResultsPath);

  const command = `
  curl -L '${downloadUrl}' -o '${tempResultsPath}/purple-a11y-desktop-mac.zip' &&
  ditto -xk '${tempResultsPath}/purple-a11y-desktop-mac.zip' '${path.join(
    macOSExecutablePath,
    ".."
  )}' &&
  rm '${tempResultsPath}/purple-a11y-desktop-mac.zip' &&
  xattr -rd com.apple.quarantine '${path.join(macOSExecutablePath, "..")}/Purple A11y.app' && 
  open '${path.join(macOSExecutablePath, "..")}/Purple A11y.app' &&
  rm -rf '${macOSExecutablePath}'`;

  await execCommand(command);

};

/**
 * Spawn a PowerShell process to launch the InnoSetup installer executable, which contains the frontend and backend
 * upon confirmation from the user, the installer will be launched & Electron will exit
 * @returns {Promise<boolean>} true if the installer executable was launched successfully, false otherwise
 */
const spawnScriptToLaunchInstaller = () => {
  const tempResultsPath = path.join(process.env.APPDATA, "Purple A11y");
  const tempInstallerExePath = path.join(
    tempResultsPath,
    "purple-a11y-desktop-windows",
    "Purple-A11y-Setup.exe"
  );
  const shellScript = `Start-Process -FilePath "${tempInstallerExePath}"`;

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
  const downloadUrl = `https://github.com/GovTechSG/purple-a11y/releases/download/${tag}/purple-a11y-portable-mac.zip`;
  const command = `curl '${downloadUrl}' -o '${phZipPath}' -L && rm -rf '${backendPath}' && mkdir '${backendPath}'`;

  return async () => await execCommand(command);
};

// MacOS only
const validateZipFile = async (zipPath) => {
  const isZipValid = async (zipPath) => {
    const command = `
      if unzip -t "${zipPath}" >/dev/null 2>&1; then
        echo "true" 
      else
        echo "false"
      fi
    `;
    const result = await execCommand(command);
    return result.trim() === 'true';
  }
  return fs.existsSync(zipPath) && await isZipValid(zipPath);
};

const hashAndSaveZip = (zipPath) => {
  return async () => {
    const currHash = await hashPrepackage(zipPath);
    fs.writeFileSync(hashPath, currHash);
  }
}

const run = async (updaterEventEmitter, latestRelease, latestPreRelease) => {
  const processesToRun = [];

  updaterEventEmitter.emit("checking");

  const backendExists = fs.existsSync(backendPath);
  const phZipExists = fs.existsSync(phZipPath);

  const toUpdateFrontendVer = getLatestFrontendVersion(latestRelease, latestPreRelease);

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
              // TODO: Should not need this, basically fresh install because userData.txt should not exist
              // writeUserDetailsToFile({ firstLaunchOnUpdate: true });
              updaterEventEmitter.emit("installerLaunched");
            }
          }
        } else {
          updaterEventEmitter.emit("frontendDownloadFailed");
        }
      }
    } else if (!backendExists) {
      // TODO: should not enter here
      console.log("Should not enter backend does not exist block")
      updaterEventEmitter.emit('settingUp');
      // Trigger download for backend via Github if backend does not exist
      // TODO: Did not work on this for updater (old impl)
      await downloadAndUnzipBackendWindows(appFrontendVer);
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
          // downloads and opens the new frontend
          await downloadAndUnzipFrontendMac(toUpdateFrontendVer);

          currentChildProcess = null;

          // exit the old (current) app
          processesToRun.push(() => updaterEventEmitter.emit("installerLaunched"));
        } catch (e) {
          silentLogger.error(e.toString());
        }
      } 
    } 
    
    if (!backendExists) {
      updaterEventEmitter.emit('settingUp');
      if (await validateZipFile(macOSPrepackageBackend)) {
        // Trigger an unzip from Resources folder if backend does not exist or backend is older
        processesToRun.push(
          await unzipBackendAndCleanUp(macOSPrepackageBackend),
          hashAndSaveZip(macOSPrepackageBackend)
        );
      } else {
        processesToRun.push(
          await downloadBackend(appFrontendVer),
          hashAndSaveZip(phZipPath),
          await unzipBackendAndCleanUp()
        );
      }
    } else if (backendExists && await validateZipFile(macOSPrepackageBackend)) {
      // compare zip file hash to determine whether to unzip
      // current hash of prepackage
      const currHash = await hashPrepackage(macOSPrepackageBackend);
      if (fs.existsSync(hashPath)) {
        // check if match 
        const hash = fs.readFileSync(hashPath, "utf-8"); // stored hash
        // compare 
        if (hash === currHash) {
          // dont unzip
          return;
        } 
      }
      processesToRun.push(() => updaterEventEmitter.emit('settingUp'));
      // unzip
      processesToRun.push(await unzipBackendAndCleanUp(macOSPrepackageBackend));
      // write hash
      processesToRun.push(() => fs.writeFileSync(hashPath, currHash));
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