/* This file provides methods that interfaces between the API functions exposed by the electron main process
and the renderer. The APIs are provided via the window.services object, as defined in ./public/preload.js
*/

import {
  scanTypes,
  userDataFormDetails,
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
    scanInBackground,
  } = scanDetails;

  currentScanUrl = scanUrl;
  currentScanType = selectedScanType;

  const scanArgs = {
    scanType: scanTypes[selectedScanType],
    url: scanUrl,
    headlessMode: scanInBackground,
  };

  if (selectedScanType !== Object.keys(scanTypes)[2]) {
    scanArgs.maxPages = pageLimit;
  }

  if (viewport === viewportTypes[1]) {
    scanArgs.customDevice = Object.keys(devices)[0];
  }

  if (viewport === viewportTypes[2]) {
    scanArgs.customDevice = devices[device];
  }

  if (viewport === viewportTypes[3]) {
    scanArgs.viewportWidth = viewportWidth;
  }

  const response = await window.services.startScan(scanArgs);
  return response;
};

const openReport = (scanId) => {
  window.services.openReport(scanId);
};

const downloadResults = async (scanId) => {
  const reportZip = await window.services.downloadResults(scanId);
  return reportZip;
};

const mailReport = async (formDetails, scanId) => {
  const response = await window.services.mailReport(formDetails, scanId);
  return response;
};

const getUserDataFormUrl = () => {
  const { formUrl, urlScannedField, scanTypeField } = userDataFormDetails;
  const encodedUrl = encodeURIComponent(currentScanUrl);
  const encodedScanType = encodeURIComponent(currentScanType);

  return `${formUrl}/?${urlScannedField}=${encodedUrl}&${scanTypeField}=${encodedScanType}`;
};

const openUserDataForm = () => {
  window.services.openUserDataForm(getUserDataFormUrl());
};

const closeUserDataForm = () => {
  window.services.closeUserDataForm();
};

const services = {
  startScan,
  openReport,
  downloadResults,
  mailReport,
  getUserDataFormUrl,
  openUserDataForm,
  closeUserDataForm,
};

export default services;
