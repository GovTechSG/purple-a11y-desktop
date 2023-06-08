const path = require("path");
const os = require("os");

const appPath =
  os.platform() === "win32"
    ? path.join(process.env.PROGRAMFILES, "Purple HATS Desktop")
    : path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Purple HATS"
      );

const releaseUrl =
  "https://api.github.com/repos/GovTechSG/purple-hats/releases/latest";

const resultsPath = path.join(process.env.APPDATA, "Purple HATS");

const backendPath = path.join(appPath, "Purple HATS Backend");

const enginePath = path.join(backendPath, "purple-hats");

const getEngineVersion = () =>
  require(path.join(enginePath, "package.json")).version;

const appVersion = require(path.join(
  __dirname,
  "..",
  "..",
  "package.json"
)).version;

const preloadPath = path.join(__dirname, "preload.js");

const userDataFormPreloadPath = path.join(__dirname, "userDataFormPreload.js");

const indexPath = path.join(__dirname, "..", "..", "build", "index.html");

const playwrightBrowsersPath = path.join(backendPath, "ms-playwright");

const getPathVariable = () => {
  if (os.platform() === "win32") {
    const directories = [
      "nodejs-win",
      "purple-hats\\node_modules\\.bin",
      "ImageMagick\\bin",
    ];
    return `${process.env.PATH};${directories
      .map((d) => path.join(backendPath, d))
      .join(";")}`;
  } else {
    const directories = [
      `${os.arch() === "arm64" ? "nodejs-mac-arm64" : "nodejs-mac-x64"}/bin`,
      "purple-hats/node_modules/.bin",
    ];
    return `${process.env.PATH}:${directories
      .map((d) => path.join(backendPath, d))
      .join(":")}`;
  }
};

const scanResultsPath = path.join(enginePath, "results");

const customFlowGeneratedScriptsPath = path.join(
  enginePath,
  "custom_flow_scripts"
);

const updateBackupsFolder = path.join(
  appPath,
  "30789f0f-73f5-43bc-93a6-e499e4a20f7a"
);

const userDataFilePath = path.join(appDataPath, "userData.txt");

const phZipPath = path.join(appDataPath, "PHLatest.zip");

module.exports = {
  appPath,
  releaseUrl,
  backendPath,
  enginePath,
  getEngineVersion,
  appVersion,
  preloadPath,
  userDataFormPreloadPath,
  indexPath,
  playwrightBrowsersPath,
  getPathVariable,
  scanResultsPath,
  customFlowGeneratedScriptsPath,
  updateBackupsFolder,
  phZipPath,
  resultsPath,
  userDataFilePath,
};
