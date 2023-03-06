const path = require("path");

const releaseUrl = "https://api.github.com/repos/GovTechSG/purple-hats/releases/latest";

const backendPath = path.join(__dirname, "..", "backend");

const preloadPath = path.join(__dirname, "preload.js");

const indexPath = path.join(__dirname, "../build/index.html");

module.exports = {
    releaseUrl,
    backendPath,
    preloadPath,
    indexPath,
}