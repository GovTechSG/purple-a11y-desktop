const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const axios = require("axios");
const {
  releaseUrl,
  enginePath,
  appDataPath,
  backendPath,
} = require("./constants");
const { silentLogger } = require("./logs");

const execCommand = (command) => {
  let options = { cwd: appDataPath };

  if (os.platform() === "win32") {
    options.shell = "powershell.exe";
  }

  try {
    execSync(command, options);
  } catch (error) {
    silentLogger.error(error.stderr.toString());
  }
};

const getDownloadUrlFromReleaseData = (data) => {
  const osToUrl = {};

  data.assets.forEach((e) => {
    const url = e.browser_download_url;

    if (url.endsWith("windows.zip")) {
      osToUrl.win32 = url;
    } else if (url.endsWith("mac-x64.zip")) {
      osToUrl.macx64 = url;
    } else {
      osToUrl.macarm64 = url;
    }
  });

  if (os.platform() === "win32") {
    return osToUrl.win32;
  }

  const arch = execSync("uname -m").toString().trim();

  if (arch === "x86_64") {
    return osToUrl.macx64;
  } else {
    return osToUrl.macarm64;
  }
};

const downloadBackend = async () => {
  const { data } = await axios.get(releaseUrl);
  const downloadUrl = getDownloadUrlFromReleaseData(data);

  let command;

  if (os.platform() === "win32") {
    command = `$ProgressPreference = 'SilentlyContinue';
      Set-Location "${appDataPath}";
      New-Item "${backendPath}" -ItemType directory;
      Invoke-WebRequest "${downloadUrl}" -OutFile PHLatest.zip;
      tar -xf PHLatest.zip -C "${backendPath}";
      Remove-Item PHLatest.zip;
      `;
  } else {
    command = `cd "${appDataPath}" &&
      mkdir "${backendPath}" &&
      curl "${downloadUrl}" -o PHLatest.zip -L &&
      tar -xf PHLatest.zip -C "${backendPath}" &&
      rm PHLatest.zip`;
  }

  execCommand(command);
};

// FUTURE IMPLEMENTATION (only mac version done)
// const downloadBackend = async () => {
//   const { data } = await axios.get(releaseUrl);
//   // const downloadUrl = data.assets[0].browser_download_url;

//   let command;

//   if (os.platform() === "win32") {
//     command = `Invoke-WebRequest "${downloadUrl}" -OutFile PHLatest.zip;
//       New-Item backend -ItemType directory;
//       tar -xzf PHLatest.tar.gz -C backend --strip-components=1;
//       Remove-Item PHLatest.tar.gz;
//       Set-Location backend;
//       npm install;
//       `;
//   } else {
//     command = `cd "${appDataPath}" &&
//     curl "${downloadUrl}" -o PHLatest.tar.gz -L &&
//     mkdir purple-hats &&
//     tar -xzf PHLatest.tar.gz -C purple-hats --strip-components=1 &&
//     rm PHLatest.tar.gz &&
//     export PATH=$PATH:"${__dirname}/../nodejs-mac-x64/bin" &&
//     cd purple-hats &&
//     npm install`;
//   }

//   execCommand(command);

// };

const checkForBackendUpdates = async () => {
  const currentVersion = require(path.join(enginePath, "package.json")).version;
  const { data } = await axios.get(releaseUrl);
  const latestVersion = data.tag_name;

  if (currentVersion === latestVersion) {
    return { isLatestVersion: true };
  }

  return {
    isLatestVersion: false,
    latestDownloadUrl: getDownloadUrlFromReleaseData(data),
  };
};

const updateBackend = (downloadUrl) => {
  let command;

  if (os.platform() === "win32") {
    command = `$ProgressPreference = 'SilentlyContinue';
      Set-Location "${appDataPath}";
      Move-Item "${backendPath}\\purple-hats" purple-hats.bak;
      Invoke-WebRequest "${downloadUrl}" -OutFile PHLatest.zip;
      Remove-Item "${backendPath}\\*" -Recurse;
      tar -xf PHLatest.zip -C "${backendPath}"; 
      Move-Item purple-hats.bak\\results "${backendPath}\\purple-hats";
      Remove-Item purple-hats.bak -Recurse;
      Remove-Item PHLatest.zip;
      `;
  } else {
    command = `cd "${appDataPath}" &&
      mv "${backendPath}/purple-hats" purple-hats.bak && 
      curl "${downloadUrl}" -o PHLatest.zip -L &&
      rm -r "${backendPath}/*"
      tar -xf PHLatest.zip -C "${backendPath}" && 
      mv purple-hats.bak/results "${backendPath}/purple-hats" &&
      rm -r purple-hats.bak &&
      rm PHLatest.zip
      `;
  }

  execCommand(command);
};

module.exports = {
  downloadBackend,
  checkForBackendUpdates,
  updateBackend,
};
