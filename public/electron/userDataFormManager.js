const { ipcMain, BrowserView } = require("electron");
// const path = require("path");
// const os = require("os");
// const fs = require("fs");
// import { globSync } from 'glob';

// const browserTypes = {
//   chrome: 'chrome', 
//   edge: 'msedge',
//   chromium: null
// }

const init = () => {
  ipcMain.on("submitFormViaBrowser", async (_event, formDetails) => {
    const playwright = require('/Users/erinong/Library/Application Support/Purple HATS/backend/purple-hats/node_modules/playwright/index.js'); 
    const chromium = playwright.chromium;

    // const chromeDataDir = getDefaultChromeDataDir(); 
    // const edgeDataDir = getDefaultEdgeDataDir(); 

    // let browserChannel; 
    // let userDataDir; 

    // if (formDetails.browserBased == browserTypes.chrome) {
    //   if (chromeDataDir) {
    //     browserChannel = browserTypes.chrome;
    //     userDataDir = cloneChromeProfiles();
    //   } else {
    //     if (edgeDataDir) {
    //       browserChannel = browserTypes.edge; 
    //       userDataDir = cloneEdgeProfiles()
    //     } else {
    //       browserChannel = browserTypes.chromium; 
    //     }
    //   }
    // } 

    // if (formDetails.browserBased == browserTypes.edge) {
    //   if (edgeDataDir) {
    //     browserChannel = browserTypes.edge; 
    //     userDataDir = cloneEdgeProfiles()
    //   } else {
    //     if (chromeDataDir) {
    //       browserChannel = browserTypes.chrome;
    //       userDataDir = cloneChromeProfiles();
    //     } else {
    //       browserChannel = browserTypes.chromium; 
    //     }
    //   }
    // }

    // const browser = await chromium.launchPersistentContext(
    //   userDataDir, 
    //   {
    //     ignoreDefaultArgs: ['--use-mock-keychain'], 
    //     ...(browserChannel && {channel: browserChannel}),
    //     headless: false
    //   }
    // );

    const browser = await chromium.launch({
      channel: formDetails.browserBased, 
      headless: false
    })
    const context = await browser.newContext(
      {
        ignoreHTTPSErrors: true,
        serviceWorkers: 'block'
      }
    ); 
    const page = await context.newPage();

    await page.goto(formDetails.formUrl);
    await page.getByRole('textbox', { name: 'Website URL' }).fill(formDetails.websiteUrl);
    await page.getByRole('textbox', { name: 'Scan Type' }).click();
    await page.getByRole('textbox', { name: 'Scan Type' }).fill(formDetails.scanType);
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(formDetails.email);
    await page.getByRole('textbox', { name: 'Name' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(formDetails.name);
    await page.getByRole('button', { name: 'Submit' }).click();

    // if (browserChannel == browserTypes.chrome) {
    //   deleteClonedChromeProfiles(); 
    // } else if (browserChannel == browserTypes.edge) {
    //   deleteClonedEdgeProfiles; 
    // }

    await context.close();
    await browser.close();
  }) 
}

const getDefaultChromeDataDir = () => {
  try {
    if (os.platform() === "win32") {
      return path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data"
      );
    }

    if (os.platform() === "darwin") {
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
    }
  } catch (error) {
    console.error(`Error in getDefaultChromeDataDir(): ${error}`);
  }
};

const getDefaultEdgeDataDir = () => {
  try {
    if (os.platform() === "win32") {
      return path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Microsoft",
        "Edge",
        "User Data"
      );
    }

    if (os.platform() === "darwin") {
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Microsoft Edge"
      );
    }
  } catch (error) {
    console.error(`Error in getDefaultEdgeDataDir(): ${error}`);
  }
};

const cloneChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error('Unable to find Chrome data directory in the system.');
    return;
  }

  const destDir = path.join(baseDir, 'Purple-HATS');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneChromeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, 'Purple-HATS');
};

const cloneEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error('Unable to find Edge data directory in the system.');
    return;
  }

  const destDir = path.join(baseDir, 'Purple-HATS');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneEdgeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, 'Purple-HATS');
};


const cloneChromeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  if (os.platform() === 'win32') {
    profileCookiesDir = globSync('**/Network/Cookies', {
      ...options,
      ignore: ['Purple-HATS/**'],
    });
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === 'darwin') {
    // maxDepth 2 to avoid copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync('**/Cookies', {
      ...options,
      ignore: 'Purple-HATS/**',
    });
    profileNamesRegex = /Chrome\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map(dir => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === 'win32') {
          destProfileDir = path.join(destProfileDir, 'Network');
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, 'Cookies'))) {
          fs.copyFileSync(dir, path.join(destProfileDir, 'Cookies'));
        }
      }
    });
  } else {
    console.error('Unable to find Chrome profile cookies file in the system.');
    return;
  }
};

const cloneEdgeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  // Ignores the cloned Purple-HATS directory if exists
  if (os.platform() === 'win32') {
    ignore: ['Purple-HATS/**'],
      (profileCookiesDir = globSync('**/Network/Cookies', {
        ...options,
      }));
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === 'darwin') {
    // Ignores copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync('**/Cookies', {
      ...options,
      ignore: 'Purple-HATS/**',
    });
    profileNamesRegex = /Microsoft Edge\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map(dir => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === 'win32') {
          destProfileDir = path.join(destProfileDir, 'Network');
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, 'Cookies'))) {
          fs.copyFileSync(dir, path.join(destProfileDir, 'Cookies'));
        }
      }
    });
  } else {
    console.error('Unable to find Edge profile cookies file in the system.');
    return;
  }
};

const cloneLocalStateFile = (options, destDir) => {
  const localState = globSync('**/*Local State', {
    ...options,
    maxDepth: 1,
  });

  if (localState.length > 0) {
    localState.map(dir => {
      fs.copyFileSync(dir, path.join(destDir, 'Local State'));
    });
  } else {
    console.error('Unable to find local state file in the system.');
    return;
  }
};

const deleteClonedChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error('Unable to find Chrome data directory in the system.');
    return;
  }

  const destDir = path.join(baseDir, 'Purple-HATS');

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error('Unable to find Purple-HATS directory in the Chrome data directory.');
    return;
  }
};

const deleteClonedEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error('Unable to find Edge data directory in the system.');
    return;
  }

  const destDir = path.join(baseDir, 'Purple-HATS');

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error('Unable to find Purple-HATS directory in the Edge data directory.');
    return;
  }
};


module.exports = {
  init,
};
