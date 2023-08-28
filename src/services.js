/* This file provides methods that interfaces between the API functions exposed by the electron main process
and the renderer. The APIs are provided via the window.services object, as defined in ./public/preload.js
*/

import {
  scanTypes,
  viewportTypes,
  devices,
} from "./common/constants";

// for use in openUserDataForm
let currentScanUrl;
let currentScanType;

const startScan = async (scanDetails) => {
  const {
    scanType: selectedScanType,
    scanUrl,
    pageLimit,
    viewport,
    device,
    viewportWidth,
    // scanInBackground,
    browser,
    maxConcurrency,
    falsePositive
  } = scanDetails;

  currentScanUrl = scanUrl;
  currentScanType = selectedScanType;
  const scanArgs = {
    scanType: scanTypes[selectedScanType],
    url: scanUrl,
    headlessMode: scanTypes[selectedScanType] !== 'custom',
    browser: browser,
    maxConcurrency: maxConcurrency,
    falsePositive: falsePositive
  };

  if (selectedScanType !== Object.keys(scanTypes)[2]) {
    scanArgs.maxPages = pageLimit;
  }

  if (viewport === viewportTypes.mobile) {
    scanArgs.customDevice = "Mobile";
  }

  if (viewport === viewportTypes.specific) {
    scanArgs.customDevice = devices[device];
  }

  if (viewport === viewportTypes.custom) {
    scanArgs.viewportWidth = viewportWidth;
  }

  const response = await window.services.startScan(scanArgs);
  console.log("services: ", response);
  return response;
};

const openReport = (scanId) => {
  window.services.openReport(scanId);
};

const getResultsFolderPath = async (scanId) => {
  const reportPath = await window.services.getResultsFolderPath(scanId);
  return reportPath;
};

const getUserData = async () => {
  const userData = await window.services.getUserData();
  return userData;
};

const getDataForForm = async () => {
  const userData = await getUserData();
  const email = userData["email"];
  const name = userData["name"];
  const event = userData["event"];
  const browser = userData["browser"];
  const exportDir = userData["exportDir"];
  return {
    websiteUrl: currentScanUrl,
    scanType: currentScanType,
    email: email,
    name: name,
    event: event,
    browser: browser,
    exportDir: exportDir
  };
};

const isValidEmail = (email) => {
  const emailRegex = new RegExp(
    /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
    "gm"
  );

  return emailRegex.test(email);
};

const mailReport = async (formDetails, scanId) => {
  const response = await window.services.mailReport(formDetails, scanId);
  return response;
};

const getIsWindows = async () => window.services.getIsWindows();

const services = {
  startScan,
  openReport,
  getResultsFolderPath,
  getUserData,
  getDataForForm,
  isValidEmail,
  mailReport,
  getIsWindows,
};

export default services;
