const {
  createPlaywrightContext,
  userDataFormFields,
  deleteClonedProfiles,
} = require("./constants");
const { ipcMain, BrowserView, BrowserWindow } = require("electron");
const constants = require("./constants");
const os = require("os");

const init = () => {
  ipcMain.on("submitFormViaBrowser", async (_event, formDetails) => {
    const { context, browserChannel, proxy } = await createPlaywrightContext(
      formDetails.browser,
      { width: 10, height: 10 }
    );

    const finalUrl =
      `${formDetails.formUrl}?` +
      `${userDataFormFields.websiteUrlField}=${formDetails.websiteUrl}&` +
      `${userDataFormFields.scanTypeField}=${formDetails.scanType}&` +
      `${userDataFormFields.emailField}=${formDetails.email}&` +
      `${userDataFormFields.nameField}=${formDetails.name}&` +
      `${userDataFormFields.resultsField}={}`;

    const page = await context.newPage();
    await page.goto(finalUrl, {
      ...(proxy && { waitUntil: "networkidle" }),
    });

    ipcMain.on("userDataFormSubmitted", () => {
      contextWindow.webContents.send("enableReportDownload");
    });

    deleteClonedProfiles(browserChannel);
  });
};

module.exports = {
  init,
};
