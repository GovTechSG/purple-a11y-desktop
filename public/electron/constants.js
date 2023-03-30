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

const preloadPath = path.join(__dirname, "preload.js");

const indexPath = path.join(__dirname, "..", "..", "build", "index.html");

const playwrightBrowsersPath = path.join(backendPath, "ms-playwright");

const nodePath =
  os.platform() === "win32"
    ? "nodejs-win"
    : os.arch() === "arm64"
    ? "nodejs-mac-arm64"
    : "nodejs-mac-x64";

path.join(backendPath);

module.exports = {
  appDataPath,
  releaseUrl,
  backendPath,
  enginePath,
  preloadPath,
  indexPath,
  playwrightBrowsersPath,
  nodePath
};
