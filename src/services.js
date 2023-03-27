// This file provides methods that interfaces between the API functions exposed by the electron main process
// and the renderer. The APIs are provided via the window.services object, as defined in ./public/preload.js

import { userDataFormDetails } from "./constants/constants";

export const startScan = async (scanDetails) => {
  const response = await window.services.startScan(scanDetails);
  return response;
};

export const openReport = (scanId) => {
  window.services.openReport(scanId);
};

export const downloadReport = async (scanId) => {
  const reportHtml = await window.services.downloadReport(scanId);
  return reportHtml;
};

export const openUserDataForm = (scanUrl, scanType) => {
  const { formUrl, urlScannedField, scanTypeField } = userDataFormDetails;
  const encodedUrl = encodeURIComponent(scanUrl);
  const encodedScanType = encodeURIComponent(scanType);
  window.services.openUserDataForm(
    `${formUrl}/?${urlScannedField}=${encodedUrl}&${scanTypeField}=${encodedScanType}`
  );
};

export const closeUserDataForm = () => {
  window.services.closeUserDataForm();
};
