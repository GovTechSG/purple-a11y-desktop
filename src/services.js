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

const downloadReport = async (scanId) => {
  const reportHtml = await window.services.downloadReport(scanId);
  return reportHtml;
};

const openUserDataForm = () => {
  const { formUrl, urlScannedField, scanTypeField } = userDataFormDetails;
  const encodedUrl = encodeURIComponent(currentScanUrl);
  const encodedScanType = encodeURIComponent(currentScanType);
  
  window.services.openUserDataForm(
    `${formUrl}/?${urlScannedField}=${encodedUrl}&${scanTypeField}=${encodedScanType}`
  );
};

const closeUserDataForm = () => {
  window.services.closeUserDataForm();
};

const services = {
  startScan,
  openReport,
  downloadReport,
  openUserDataForm,
  closeUserDataForm,
};

export default services;
