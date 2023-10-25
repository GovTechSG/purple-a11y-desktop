const {
  app: electronApp,
  BrowserWindow,
  ipcMain,
  shell,
  session,
} = require("electron");
const { getDefaultChromeDataDir } = require("./constants")
const os = require("os");
const axios = require("axios");
const EventEmitter = require("events");
const constants = require("./constants");
const scanManager = require("./scanManager");
const updateManager = require("./updateManager");
const userDataManager = require("./userDataManager.js");
const showdown = require('showdown');

const app = electronApp;

let launchWindow;
let mainWindow;

function createLaunchWindow() {
  launchWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });

  launchWindow.loadFile(constants.indexPath);
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: constants.preloadPath,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(constants.indexPath);
  // mainWindow.loadURL(`http://localhost:3000`)
}

// TODO set ipcMain messages
app.on("ready", async () => {
  // create settings file if it does not exist
  await userDataManager.init();

  if (constants.proxy === null) {
    const launchWindowReady = new Promise((resolve) => {
      ipcMain.once("guiReady", () => {
        resolve();
      });
    });

    createLaunchWindow();
    await launchWindowReady;
    launchWindow.webContents.send("appStatus", "launch");

    // this is used for listening to messages that updateManager sends
    const updateEvent = new EventEmitter();

    updateEvent.on("settingUp", () => {
      launchWindow.webContents.send("launchStatus", "settingUp");
    });

    updateEvent.on("checking", () => {
      launchWindow.webContents.send("launchStatus", "checkingUpdates");
    });

    updateEvent.on("promptFrontendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptFrontendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("promptBackendUpdate", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "promptBackendUpdate");
      ipcMain.once("proceedUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("updatingFrontend", () => {
      launchWindow.webContents.send("launchStatus", "updatingFrontend");
    });

    updateEvent.on("updatingBackend", () => {
      launchWindow.webContents.send("launchStatus", "updatingBackend");
    });

    updateEvent.on("frontendDownloadComplete", (userResponse) => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadComplete");
      ipcMain.once("launchInstaller", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("frontendDownloadCompleteMacOS", (userResponse) => {
      launchWindow.webContents.send(
        "launchStatus",
        "frontendDownloadCompleteMacOS"
      );
      ipcMain.once("restartAppAfterMacOSFrontendUpdate", (_event, response) => {
        userResponse(response);
      });
    });

    updateEvent.on("installerLaunched", () => {
      app.exit();
    });

    updateEvent.on("restartTriggered", () => {
      app.relaunch();
      app.exit();
    });

    updateEvent.on("frontendDownloadFailed", () => {
      launchWindow.webContents.send("launchStatus", "frontendDownloadFailed");
    });
    await updateManager.run(updateEvent);

    launchWindow.close();
  }

  const mainReady = new Promise((resolve) => {
    ipcMain.once("guiReady", () => {
      resolve();
    });
  });

  createMainWindow();

  const scanEvent = new EventEmitter();
  scanManager.init(scanEvent);
  scanEvent.on("scanningUrl", (url) => {
    mainWindow.webContents.send("scanningUrl", url);
  })
  scanEvent.on("scanningCompleted", () => {
    mainWindow.webContents.send("scanningCompleted");
  })
  
  ipcMain.on("openLink", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('getEngineVersion', () => {
    return constants.getEngineVersion();
  });

  ipcMain.on("restartApp", (_event) => {
    app.relaunch();
    app.exit();
  })
  
  ipcMain.handle("checkChromeExistsOnMac", () => {
    if (os.platform() === 'darwin') {
      return getDefaultChromeDataDir();
    } else {
      return true;
    }
  })

  ipcMain.handle("isWindows", (_event) => constants.isWindows);

  await mainReady;

  mainWindow.webContents.send("appStatus", "ready");

  const markdownToHTML = (converter, md) => {
    const escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return converter.makeHtml(escaped);
  };

  const testData = {
    "appVersion": "0.9.28",
    "latestInfo": {
        "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/125955127",
        "assets_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/125955127/assets",
        "upload_url": "https://uploads.github.com/repos/GovTechSG/purple-hats-desktop/releases/125955127/assets{?name,label}",
        "html_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/tag/0.9.28",
        "id": 125955127,
        "author": {
            "login": "Thumster",
            "id": 50561219,
            "node_id": "MDQ6VXNlcjUwNTYxMjE5",
            "avatar_url": "https://avatars.githubusercontent.com/u/50561219?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/Thumster",
            "html_url": "https://github.com/Thumster",
            "followers_url": "https://api.github.com/users/Thumster/followers",
            "following_url": "https://api.github.com/users/Thumster/following{/other_user}",
            "gists_url": "https://api.github.com/users/Thumster/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/Thumster/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/Thumster/subscriptions",
            "organizations_url": "https://api.github.com/users/Thumster/orgs",
            "repos_url": "https://api.github.com/users/Thumster/repos",
            "events_url": "https://api.github.com/users/Thumster/events{/privacy}",
            "received_events_url": "https://api.github.com/users/Thumster/received_events",
            "type": "User",
            "site_admin": false
        },
        "node_id": "RE_kwDOJfIMws4Hgew3",
        "tag_name": "0.9.28",
        "target_commitish": "main",
        "name": "2023-10-20 Purple hats (Portable Setup)",
        "draft": false,
        "prerelease": false,
        "created_at": "2023-10-20T10:15:15Z",
        "published_at": "2023-10-20T10:30:03Z",
        "assets": [
            {
                "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/assets/131525057",
                "id": 131525057,
                "node_id": "RA_kwDOJfIMws4H1unB",
                "name": "purple-hats-desktop-macos.zip",
                "label": "",
                "uploader": {
                    "login": "github-actions[bot]",
                    "id": 41898282,
                    "node_id": "MDM6Qm90NDE4OTgyODI=",
                    "avatar_url": "https://avatars.githubusercontent.com/in/15368?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/github-actions%5Bbot%5D",
                    "html_url": "https://github.com/apps/github-actions",
                    "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
                    "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
                    "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
                    "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
                    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
                    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
                    "type": "Bot",
                    "site_admin": false
                },
                "content_type": "application/zip",
                "state": "uploaded",
                "size": 419367018,
                "download_count": 9,
                "created_at": "2023-10-20T10:35:59Z",
                "updated_at": "2023-10-20T10:36:36Z",
                "browser_download_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/download/0.9.28/purple-hats-desktop-macos.zip"
            },
            {
                "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/assets/131525690",
                "id": 131525690,
                "node_id": "RA_kwDOJfIMws4H1uw6",
                "name": "purple-hats-desktop-windows.zip",
                "label": "",
                "uploader": {
                    "login": "github-actions[bot]",
                    "id": 41898282,
                    "node_id": "MDM6Qm90NDE4OTgyODI=",
                    "avatar_url": "https://avatars.githubusercontent.com/in/15368?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/github-actions%5Bbot%5D",
                    "html_url": "https://github.com/apps/github-actions",
                    "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
                    "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
                    "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
                    "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
                    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
                    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
                    "type": "Bot",
                    "site_admin": false
                },
                "content_type": "application/zip",
                "state": "uploaded",
                "size": 171809403,
                "download_count": 12,
                "created_at": "2023-10-20T10:41:43Z",
                "updated_at": "2023-10-20T10:41:47Z",
                "browser_download_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/download/0.9.28/purple-hats-desktop-windows.zip"
            }
        ],
        "tarball_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/tarball/0.9.28",
        "zipball_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/zipball/0.9.28",
        "body": "### Release info\r\nPurple hats is available as a desktop app for Mac and Windows. The setup files can be downloaded under `Assets` at the bottom of the page.\r\n\r\n### Installation Guide\r\n* Refer to the [Installation Guide](https://github.com/GovTechSG/purple-hats-desktop/blob/master/INSTALLATION.md) for Windows and Mac.\r\n\r\n### What's New\r\n#### New Features\r\n- Displays internet connection error message for Purple AI feature when there is proxy blocking the request or no internet connection \r\n- Display xpath of affected HTML element in report and allow copy to clipboard function \r\n- Group and display custom flow occurrences by step number and screenshot of pages \r\n- Implement lightbox to display full-size screenshots for custom flow scans\r\n- Update axe core rule descriptions based on QC comments \r\n- Handle captcha input fields for custom flow scans\r\n\r\n#### Improvements\r\n- Add new custom flow screen for prepare scan step\r\n- Styling changes to completed screen \r\n- Styling changes for browser error messages\r\n- Validate url before starting scan\r\n- Resolve minor styling and functionality issues in report\r\n\r\n#### Fixes\r\n- Resolve an error when element to be screenshot disappear from viewport\r\n- Resolve an error when button with onclick that executes window.open causes enqueueLinks to crash\r\n- Resolve an error when meta redirect tag causes refresh to a different url"
    },
    "latestPrereleaseInfo": {
        "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/125800659",
        "assets_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/125800659/assets",
        "upload_url": "https://uploads.github.com/repos/GovTechSG/purple-hats-desktop/releases/125800659/assets{?name,label}",
        "html_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/tag/0.9.26",
        "id": 125800659,
        "author": {
            "login": "younglim",
            "id": 2021525,
            "node_id": "MDQ6VXNlcjIwMjE1MjU=",
            "avatar_url": "https://avatars.githubusercontent.com/u/2021525?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/younglim",
            "html_url": "https://github.com/younglim",
            "followers_url": "https://api.github.com/users/younglim/followers",
            "following_url": "https://api.github.com/users/younglim/following{/other_user}",
            "gists_url": "https://api.github.com/users/younglim/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/younglim/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/younglim/subscriptions",
            "organizations_url": "https://api.github.com/users/younglim/orgs",
            "repos_url": "https://api.github.com/users/younglim/repos",
            "events_url": "https://api.github.com/users/younglim/events{/privacy}",
            "received_events_url": "https://api.github.com/users/younglim/received_events",
            "type": "User",
            "site_admin": false
        },
        "node_id": "RE_kwDOJfIMws4Hf5DT",
        "tag_name": "0.9.29",
        "target_commitish": "main",
        "name": "2023-10-19 Purple hats Desktop",
        "draft": false,
        "prerelease": true,
        "created_at": "2023-10-19T13:48:11Z",
        "published_at": "2023-10-19T13:48:45Z",
        "assets": [
            {
                "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/assets/131381434",
                "id": 131381434,
                "node_id": "RA_kwDOJfIMws4H1Li6",
                "name": "purple-hats-desktop-macos.zip",
                "label": "",
                "uploader": {
                    "login": "github-actions[bot]",
                    "id": 41898282,
                    "node_id": "MDM6Qm90NDE4OTgyODI=",
                    "avatar_url": "https://avatars.githubusercontent.com/in/15368?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/github-actions%5Bbot%5D",
                    "html_url": "https://github.com/apps/github-actions",
                    "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
                    "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
                    "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
                    "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
                    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
                    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
                    "type": "Bot",
                    "site_admin": false
                },
                "content_type": "application/zip",
                "state": "uploaded",
                "size": 419361835,
                "download_count": 12,
                "created_at": "2023-10-19T14:44:41Z",
                "updated_at": "2023-10-19T14:45:16Z",
                "browser_download_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/download/0.9.26/purple-hats-desktop-macos.zip"
            },
            {
                "url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/assets/131374104",
                "id": 131374104,
                "node_id": "RA_kwDOJfIMws4H1JwY",
                "name": "purple-hats-desktop-windows.zip",
                "label": "",
                "uploader": {
                    "login": "github-actions[bot]",
                    "id": 41898282,
                    "node_id": "MDM6Qm90NDE4OTgyODI=",
                    "avatar_url": "https://avatars.githubusercontent.com/in/15368?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/github-actions%5Bbot%5D",
                    "html_url": "https://github.com/apps/github-actions",
                    "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
                    "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
                    "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
                    "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
                    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
                    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
                    "type": "Bot",
                    "site_admin": false
                },
                "content_type": "application/zip",
                "state": "uploaded",
                "size": 152644869,
                "download_count": 16,
                "created_at": "2023-10-19T14:00:01Z",
                "updated_at": "2023-10-19T14:00:06Z",
                "browser_download_url": "https://github.com/GovTechSG/purple-hats-desktop/releases/download/0.9.26/purple-hats-desktop-windows.zip"
            }
        ],
        "tarball_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/tarball/0.9.26",
        "zipball_url": "https://api.github.com/repos/GovTechSG/purple-hats-desktop/zipball/0.9.26",
        "body": "### Release info\r\nPurple hats is available as a desktop app for Mac and Windows. The setup files can be downloaded under `Assets` at the bottom of the page.\r\n\r\n### Installation Guide\r\n* Refer to the [Installation Guide](https://github.com/GovTechSG/purple-hats-desktop/blob/master/INSTALLATION.md) for Windows and Mac.\r\n\r\n### What's New\r\n#### New Features\r\n- Displays internet connection error message for Purple AI feature when there is proxy blocking the request or no internet connection \r\n- Display xpath of affected HTML element in report and allow copy to clipboard function \r\n- Group and display custom flow occurrences by step number and screenshot of pages \r\n- Implement lightbox to display full-size screenshots for custom flow scans\r\n- Update axe core rule descriptions based on QC comments \r\n\r\n#### Improvements\r\n- Add new custom flow screen for prepare scan step\r\n- Styling changes to completed screen \r\n- Styling changes for browser error messages\r\n- Validate url before starting scan\r\n- Resolve minor styling and functionality issues in report\r\n\r\n#### Fixes\r\n- Resolve an error when element to be screenshot disappear from viewport\r\n- Resolve an error when iframe causes PlaywrightCrawler enqueueLinks to crash\r\n"
    },
    "latestPreNotes": "<h3 id=\"releaseinfo\">Release info</h3>\n<p>Purple hats is available as a desktop app for Mac and Windows. The setup files can be downloaded under <code>Assets</code> at the bottom of the page.</p>\n<h3 id=\"installationguide\">Installation Guide</h3>\n<ul>\n<li>Refer to the <a href=\"https://github.com/GovTechSG/purple-hats-desktop/blob/master/INSTALLATION.md\">Installation Guide</a> for Windows and Mac.</li>\n</ul>\n<h3 id=\"whatsnew\">What's New</h3>\n<h4 id=\"newfeatures\">New Features</h4>\n<ul>\n<li>Displays internet connection error message for Purple AI feature when there is proxy blocking the request or no internet connection </li>\n<li>Display xpath of affected HTML element in report and allow copy to clipboard function </li>\n<li>Group and display custom flow occurrences by step number and screenshot of pages </li>\n<li>Implement lightbox to display full-size screenshots for custom flow scans</li>\n<li>Update axe core rule descriptions based on QC comments </li>\n</ul>\n<h4 id=\"improvements\">Improvements</h4>\n<ul>\n<li>Add new custom flow screen for prepare scan step</li>\n<li>Styling changes to completed screen </li>\n<li>Styling changes for browser error messages</li>\n<li>Validate url before starting scan</li>\n<li>Resolve minor styling and functionality issues in report</li>\n</ul>\n<h4 id=\"fixes\">Fixes</h4>\n<ul>\n<li>Resolve an error when element to be screenshot disappear from viewport</li>\n<li>Resolve an error when iframe causes PlaywrightCrawler enqueueLinks to crash</li>\n</ul>",
    "latestRelNotes": "<h3 id=\"releaseinfo\">Release info</h3>\n<p>Purple hats is available as a desktop app for Mac and Windows. The setup files can be downloaded under <code>Assets</code> at the bottom of the page.</p>\n<h3 id=\"installationguide\">Installation Guide</h3>\n<ul>\n<li>Refer to the <a href=\"https://github.com/GovTechSG/purple-hats-desktop/blob/master/INSTALLATION.md\">Installation Guide</a> for Windows and Mac.</li>\n</ul>\n<h3 id=\"whatsnew\">What's New</h3>\n<h4 id=\"newfeatures\">New Features</h4>\n<ul>\n<li>Displays internet connection error message for Purple AI feature when there is proxy blocking the request or no internet connection </li>\n<li>Display xpath of affected HTML element in report and allow copy to clipboard function </li>\n<li>Group and display custom flow occurrences by step number and screenshot of pages </li>\n<li>Implement lightbox to display full-size screenshots for custom flow scans</li>\n<li>Update axe core rule descriptions based on QC comments </li>\n<li>Handle captcha input fields for custom flow scans</li>\n</ul>\n<h4 id=\"improvements\">Improvements</h4>\n<ul>\n<li>Add new custom flow screen for prepare scan step</li>\n<li>Styling changes to completed screen </li>\n<li>Styling changes for browser error messages</li>\n<li>Validate url before starting scan</li>\n<li>Resolve minor styling and functionality issues in report</li>\n</ul>\n<h4 id=\"fixes\">Fixes</h4>\n<ul>\n<li>Resolve an error when element to be screenshot disappear from viewport</li>\n<li>Resolve an error when button with onclick that executes window.open causes enqueueLinks to crash</li>\n<li>Resolve an error when meta redirect tag causes refresh to a different url</li>\n</ul>"
};

  // TODO: determine info to send to UI for new "About" modal
  // get all releases 
  const { data: releases } = await axios.get(
    `https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases`
  )
  .catch(err => {
    console.log('Unable to get releases');
    return { data: undefined };
  });
  // get latest prerelease info for lab mode users 
  // get latest release info for normal users
  if (releases) {
    // sort releases in descending publish date order
    const sorted = releases.sort((a, b) => b.published_at - a.published_at);
    const prereleases = sorted.filter(rel => rel.prerelease); // get all prereleases
    const regReleases = sorted.filter(rel => !rel.prerelease); // get all regular releases
    let latestPre = prereleases[0];
    latestPre.tag_name = "0.9.29" // TEST ONLY DELETE LATER
    const latestRel = regReleases[0];

    // handle case where release > prerelease version
    if (constants.versionComparator(latestRel.tag_name, latestPre.tag_name) === 1) {
      latestPre = latestRel;
    }

    const markdownConverter = new showdown.Converter();
    const latestPreNotes = markdownToHTML(markdownConverter, latestPre.body);
    const latestRelNotes = markdownToHTML(markdownConverter, latestRel.body);
    // send above 2 info to ui, compare app version within the modal component later
    mainWindow.webContents.send("versionInfo", {
      appVersion: constants.appVersion,
      latestInfo: latestRel,
      latestPrereleaseInfo: latestPre,
      latestPreNotes,
      latestRelNotes,
    });
  } else {
    mainWindow.webContents.send("versionInfo", {
      appVersion: constants.appVersion,
    });
  }
  // mainWindow.webContents.send("versionInfo", testData);

  // const { data: latestRelease } = await axios.get(
  //   `https://api.github.com/repos/GovTechSG/purple-hats-desktop/releases/latest`
  // )
  // .catch(err => {
  //   console.log('Unable to get the latest release info');
  //   return { data: undefined };
  // });
  // if (latestRelease) {
  //   const isLatest = constants.versionComparator(constants.appVersion, latestRelease.tag_name) === 1;
  //   const markdownConverter = new showdown.Converter();
  //   const escapedBody = latestRelease.body
  //     .replace(/&/g, "&amp;")
  //     .replace(/</g, "&lt;")
  //     .replace(/>/g, "&gt;");
  //   const latestReleaseHtml = markdownConverter.makeHtml(escapedBody);
  //   mainWindow.webContents.send("versionInfo", {
  //     appVersion: constants.appVersion,
  //     isLatest,
  //     latestReleaseNotes: latestReleaseHtml,
  //   });
  // } else {
  //   mainWindow.webContents.send("versionInfo", {
  //     appVersion: constants.appVersion,
  //   });
  // }
  
  mainWindow.webContents.send("isProxy", constants.proxy);

  const userDataEvent = new EventEmitter();
  userDataEvent.on("userDataDoesNotExist", (setUserData) => {
    mainWindow.webContents.send("userDataExists", "doesNotExist");
    ipcMain.once("userDataReceived", (_event, data) => {
      setUserData(data);
    });
  });
  userDataEvent.on("userDataDoesExist", () => {
    mainWindow.webContents.send("userDataExists", "exists");
  });

  await userDataManager.setData(userDataEvent);

  if (constants.proxy) {
    session.defaultSession.enableNetworkEmulation({
      offline: true,
    });
  }
});

app.on("quit", () => {
  // /* Synchrnously removes file upon quitting the app. Restarts/Shutdowns in
  // Windows will not trigger this event */
  // if (fs.existsSync(constants.scanResultsPath)){
  //   fs.rmSync(constants.scanResultsPath, { recursive: true }, err => {
  //     if (err) {
  //       console.error(`Error while deleting ${constants.scanResultsPath}.`);
  //     }
  //   })
  // }
  updateManager.killChildProcess();
  scanManager.killChildProcess();
});
