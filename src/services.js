/* This file provides methods that interfaces between the API functions exposed by the electron main process
and the renderer. The APIs are provided via the window.services object, as defined in ./public/preload.js
*/

import {
  scanTypes,
  // userDataFormDetails,
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
    browerBased
  } = scanDetails;

  currentScanUrl = scanUrl;
  currentScanType = selectedScanType;

  const scanArgs = {
    scanType: scanTypes[selectedScanType],
    url: scanUrl,
    headlessMode: scanInBackground,
    browerBased: browerBased
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

// const getUserDataFormUrl = () => {
//   const { formUrl, urlScannedField, scanTypeField } = userDataFormDetails;
//   const encodedUrl = encodeURIComponent(currentScanUrl);
//   const encodedScanType = encodeURIComponent(currentScanType);

//   return `${formUrl}/?${urlScannedField}=${encodedUrl}&${scanTypeField}=${encodedScanType}`;
// };

// const openUserDataForm = () => {
//   window.services.openUserDataForm(getUserDataFormUrl());
// };

// const closeUserDataForm = () => {
//   window.services.closeUserDataForm();
// };

const getUserData = async () => {
  const userData = await window.services.getUserData(); 
  return userData;
}

const getDataForForm = async () => {
  const userData = await getUserData();
  const email = userData['email']; 
  const name = userData['name'];
  const autoSubmit = userData['autoSubmit'];
  const event = userData['event'];
  const browserBased = userData['browserBased'];
  return {
    websiteUrl: currentScanUrl, 
    scanType: currentScanType, 
    email: email, 
    name: name,
    autoSubmit: autoSubmit, 
    event: event,
    browserBased: browserBased
  }
};

const isValidEmail = (email) => {
  let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
  return regex.test(email);
}

const services = {
  startScan,
  openReport,
  downloadResults,
  // getUserDataFormUrl,
  // openUserDataForm,
  // closeUserDataForm,
  getUserData, 
  getDataForForm,
  isValidEmail
};

export default services;
