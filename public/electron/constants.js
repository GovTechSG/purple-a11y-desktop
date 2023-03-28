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

module.exports = {
  appDataPath,
  releaseUrl,
  backendPath,
  enginePath,
  preloadPath,
  indexPath,
};
