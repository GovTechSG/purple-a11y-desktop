const path = require("path");
const os = require("os");

const appDataPath =
  os.platform() === "win32"
    ? path.join(process.env.APPDATA, "Purple HATS")
    : path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Purple HATS"
      );

const releaseUrl =
  "https://api.github.com/repos/GovTechSG/purple-hats/releases/latest";

const backendPath = path.join(appDataPath, "backend");

const enginePath = path.join(backendPath, "purple-hats");

const engineVersion = require(path.join(enginePath, "package.json")).version;

const appVersion = require(path.join(__dirname, "..", "..", "package.json")).version;

const preloadPath = path.join(__dirname, "preload.js");

const userDataFormPreloadPath = path.join(__dirname, "userDataFormPreload.js");

const indexPath = path.join(__dirname, "..", "..", "build", "index.html");

const playwrightBrowsersPath = path.join(backendPath, "ms-playwright");

const getNodeBinariesPath = () => {
  const nodeDir =
    os.platform() === "win32"
      ? "nodejs-win"
      : os.arch() === "arm64"
      ? "nodejs-mac-arm64"
      : "nodejs-mac-x64";

  return path.join(backendPath, nodeDir, "bin");
};

const scanResultsPath = path.join(enginePath, "results");

const customFlowGeneratedScriptsPath = path.join(
  enginePath,
  "custom_flow_scripts"
);

const updateBackupsFolder = path.join(
  appDataPath,
  "30789f0f-73f5-43bc-93a6-e499e4a20f7a"
);

const phZipPath = path.join(appDataPath, "PHLatest.zip");

module.exports = {
  appDataPath,
  releaseUrl,
  backendPath,
  enginePath,
  engineVersion,
  appVersion,
  preloadPath,
  userDataFormPreloadPath,
  indexPath,
  playwrightBrowsersPath,
  getNodeBinariesPath,
  scanResultsPath,
  customFlowGeneratedScriptsPath,
  updateBackupsFolder,
  phZipPath,
};
