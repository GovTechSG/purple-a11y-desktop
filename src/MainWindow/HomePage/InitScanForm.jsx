import React, { useState, useRef, useEffect } from "react";
import Button from "../../common/components/Button";
import AdvancedScanOptions from "./AdvancedScanOptions";
import {
  scanTypes,
  viewportTypes,
  devices,
  fileTypes,
  getDefaultAdvancedOptions,
} from "../../common/constants";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up-purple.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down-white.svg";
import LoadingSpinner from "../../common/components/LoadingSpinner";
import ToolTip from "../../common/components/ToolTip";

function convertToReadablePath(path) {
  let readable = path.replace(/\\/g, "/");
  if (/^[a-zA-Z]:/.test(readable)) {
    readable = readable.replace(/^([a-zA-Z]):/, "/$1:");
  }
  return `file:///${readable.replace(/^\/+/, "")}`;
}

const InitScanForm = ({
  isProxy,
  startScan,
  prevUrlErrorMessage,
  scanButtonIsClicked,
  setScanButtonIsClicked,
  isAbortingScan,
}) => {
  const [openPageLimitAdjuster, setOpenPageLimitAdjuster] = useState(false);
  const [pageWord, setPageWord] = useState("pages");
  const pageLimitAdjuster = useRef();
  const scanTypeOptions = Object.keys(scanTypes);
  const fileTypesOptions = Object.keys(fileTypes);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanUrl, setScanUrl] = useState("");
  const [staticHttpUrl, setStaticHttpUrl] = useState("https://");
  const [staticFilePath, setStaticFilePath] = useState("file:///");
  const [cachedNonFileScanType, setCachedNonFileScanType] = useState(() => {
    return (
      sessionStorage.getItem("cachedNonFileScanType") || scanTypeOptions[0]
    );
  });
  const [displayScanType, setDisplayScanType] = useState(scanTypeOptions[0]);
  const [allowedFileTypes, setAllowedFileTypes] = useState([]);
  const [showToggleUrlFileTooltip, setShowToggleUrlFileTooltip] =
    useState(false);

  if (isProxy) {
    delete viewportTypes.specific;
  }

  const viewportOptions = viewportTypes;
  const deviceOptions = isProxy ? [] : Object.keys(devices);

  const cachedPageLimit = sessionStorage.getItem("pageLimit");
  const cachedAdvancedOptions = sessionStorage.getItem("advancedOptions");

  const [pageLimit, setPageLimit] = useState(() => {
    return cachedPageLimit ? JSON.parse(cachedPageLimit) : "100";
  });
  const [advancedOptions, setAdvancedOptions] = useState(() => {
    return cachedAdvancedOptions
      ? JSON.parse(cachedAdvancedOptions)
      : getDefaultAdvancedOptions(isProxy);
  });

  const [isCustomOptionChecked, setIsCustomOptionChecked] = useState(() => {
    const cachedCheckboxState = sessionStorage.getItem("isCustomOptionChecked");
    return cachedCheckboxState ? JSON.parse(cachedCheckboxState) : false;
  });

  const getAllowedFileTypes = (scanType) => {
    if (scanType === scanTypeOptions[0]) {
      return [".html", ".htm", ".shtml", ".xhtml", ".pdf"];
    } else if (scanType === scanTypeOptions[1]) {
      return [".xml", ".txt"];
    }
    return [];
  };

  useEffect(() => {
    const cachedScanUrl = sessionStorage.getItem("scanUrl");
    const cachedScanType = sessionStorage.getItem("scanType");
    const wasLocalFileScan = cachedScanType === scanTypeOptions[3];

    if (wasLocalFileScan) {
      setIsCustomOptionChecked(true);
      const newScanUrl = cachedScanUrl ? JSON.parse(cachedScanUrl) : "file:///";
      setScanUrl(newScanUrl);
      setStaticFilePath(newScanUrl);
      setStaticHttpUrl("https://");
      setDisplayScanType(cachedNonFileScanType);
    } else {
      setIsCustomOptionChecked(false);
      const newScanUrl = cachedScanUrl ? JSON.parse(cachedScanUrl) : "https://";
      setScanUrl(newScanUrl);
      setStaticHttpUrl(newScanUrl);
      setStaticFilePath("file:///");
      setCachedNonFileScanType(cachedScanType || scanTypeOptions[0]);
      setDisplayScanType(cachedScanType || scanTypeOptions[0]);
    }

    setAdvancedOptions((prevOptions) => ({
      ...prevOptions,
      scanType: wasLocalFileScan
        ? cachedNonFileScanType
        : cachedScanType || prevOptions.scanType,
    }));

    setAllowedFileTypes(
      getAllowedFileTypes(cachedScanType || scanTypeOptions[0])
    );
  }, []);

  useEffect(() => {
    if (isCustomOptionChecked) {
      setStaticFilePath(scanUrl);
    } else {
      setStaticHttpUrl(scanUrl);
    }

    sessionStorage.setItem(
      "isCustomOptionChecked",
      JSON.stringify(isCustomOptionChecked)
    );
    sessionStorage.setItem(
      "scanType",
      isCustomOptionChecked ? scanTypeOptions[3] : displayScanType
    );
    sessionStorage.setItem("scanUrl", JSON.stringify(scanUrl));
    sessionStorage.setItem("cachedNonFileScanType", cachedNonFileScanType);
  }, [isCustomOptionChecked, scanUrl, displayScanType, cachedNonFileScanType]);

  useEffect(() => {
    const urlBarElem = document.getElementById("url-bar");
    const urlBarInputList = urlBarElem.querySelectorAll("input, button");
    urlBarInputList.forEach((elem) => (elem.disabled = scanButtonIsClicked));
    setOpenPageLimitAdjuster(false);
  }, [scanButtonIsClicked, prevUrlErrorMessage]);

  useEffect(() => {
    setPageWord(pageLimit === "1" ? "page" : "pages");
  }, [pageLimit]);

  useEffect(() => {
    setAllowedFileTypes(getAllowedFileTypes(displayScanType));
  }, [displayScanType]);

  const togglePageLimitAdjuster = (e) => {
    if (!e.currentTarget.disabled) {
      if (!openPageLimitAdjuster) {
        setOpenPageLimitAdjuster(true);
      } else {
        pageLimitAdjuster.current.style.animationName = "button-fade-out";
        setTimeout(() => setOpenPageLimitAdjuster(false), 200);
      }
    }
  };

  const handleScanButtonClicked = () => {
    if (isCustomOptionChecked) {
      const fileExtension = "." + scanUrl.split(".").pop().toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        alert(
          `Invalid file format. Please choose a file with one of these extensions: ${allowedFileTypes.join(
            ", "
          )}`
        );
        return;
      }
    }

    if (isProxy && advancedOptions.viewport === viewportTypes.mobile) {
      advancedOptions.viewport = viewportTypes.custom;
      advancedOptions.viewportWidth = 414;
    }

    setScanButtonIsClicked(true);
    sessionStorage.setItem("pageLimit", JSON.stringify(pageLimit));
    sessionStorage.setItem("advancedOptions", JSON.stringify(advancedOptions));
    sessionStorage.setItem("scanUrl", JSON.stringify(scanUrl));

    if (isCustomOptionChecked) {
      setStaticFilePath(scanUrl);
      startScan({
        file: selectedFile,
        scanUrl,
        ...advancedOptions,
        scanType: scanTypeOptions[3],
      });
    } else {
      setStaticHttpUrl(scanUrl);
      startScan({ scanUrl: scanUrl.trim(), pageLimit, ...advancedOptions });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (
        allowedFileTypes.includes(fileExtension) ||
        (fileExtension === ".txt" && allowedFileTypes.includes(".txt"))
      ) {
        const readablePath = convertToReadablePath(file.path);
        setScanUrl(readablePath);
        setStaticFilePath(readablePath);
        setSelectedFile(file);
      } else {
        alert(
          `Invalid file format. Please choose a file with one of these extensions: ${allowedFileTypes.join(
            ", "
          )}`
        );
        e.target.value = "";
      }
    }
  };

  const toggleScanType = () => {
    const newState = !isCustomOptionChecked;
    setIsCustomOptionChecked(newState);
    setScanUrl(newState ? staticFilePath : staticHttpUrl);
    if (newState) {
      setCachedNonFileScanType(displayScanType);
      setAdvancedOptions((prevOptions) => ({
        ...prevOptions,
        scanType: scanTypeOptions[3],
      }));
    } else {
      setAdvancedOptions((prevOptions) => ({
        ...prevOptions,
        scanType: cachedNonFileScanType,
      }));
      setDisplayScanType(cachedNonFileScanType);
    }
    const announcement = newState
      ? "File input type selected"
      : "URL input type selected";
    document.getElementById("announcement").textContent = announcement;
  };

  return (
    <div id="init-scan-form">
      <label htmlFor="url-input" id="url-bar-label">
        Enter your {isCustomOptionChecked ? "local file" : <strong>URL</strong>}{" "}
        to get started
      </label>
      <div id="url-bar-group">
        <div id="url-bar">
          {advancedOptions.scanType !== scanTypeOptions[2] && (
            <div
              className="toggle-url-file-tooltip-container"
              onMouseEnter={() => setShowToggleUrlFileTooltip(true)}
              onMouseLeave={() => setShowToggleUrlFileTooltip(false)}
              onFocus={() => setShowToggleUrlFileTooltip(true)}
              onBlur={() => setShowToggleUrlFileTooltip(false)}
            >
              <button
                type="button"
                onClick={toggleScanType}
                aria-describedby="toggle-url-file-tooltip-text"
              >
                {isCustomOptionChecked ? "FILE" : "URL"}
              </button>
              <span
                id="toggle-url-file-tooltip-text"
                className="visually-hidden"
              >
                {`Switch to ${isCustomOptionChecked ? "URL" : "file"} input`}
              </span>
              <ToolTip
                description={`Switch to ${
                  isCustomOptionChecked ? "URL" : "file"
                } input`}
                id="toggle-url-file-tooltip"
                showToolTip={showToggleUrlFileTooltip}
              />
            </div>
          )}
          <div
            id="announcement"
            className="visually-hidden"
            aria-live="polite"
          ></div>

          <input
            id="url-input"
            className={isCustomOptionChecked ? "hidden" : ""}
            type="text"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
          />
          {isCustomOptionChecked && (
            <div id="file-input-container">
              <input
                type="file"
                id="file-input"
                accept={allowedFileTypes.join(",")}
                onChange={handleFileChange}
                tabIndex="0"
              />
              <label
                htmlFor="file-input"
                id="file-input-label"
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    document.getElementById("file-input").click();
                  }
                }}
                aria-describedby="file-input-description"
              >
                {scanUrl ? scanUrl : "Choose file"}
              </label>
              <span id="file-input-description">
                Enter your local file to get started
              </span>
            </div>
          )}

          {advancedOptions.scanType !== scanTypeOptions[2] &&
            advancedOptions.scanType !== scanTypeOptions[3] &&
            !isCustomOptionChecked && (
              <div>
                <Button
                  type="btn-link"
                  id="page-limit-toggle-button"
                  onClick={(e) => togglePageLimitAdjuster(e)}
                >
                  capped at{" "}
                  <span className="purple-text">
                    {pageLimit} {pageWord}{" "}
                    {openPageLimitAdjuster ? (
                      <ButtonSvgIcon
                        className={`chevron-up-icon`}
                        svgIcon={<ChevronUpIcon />}
                      />
                    ) : (
                      <ButtonSvgIcon
                        className={`chevron-down-icon`}
                        svgIcon={<ChevronDownIcon />}
                      />
                    )}
                  </span>
                </Button>

                {openPageLimitAdjuster && (
                  <div id="page-limit-adjuster" ref={pageLimitAdjuster}>
                    <input
                      type="number"
                      id="page-limit-input"
                      step="10"
                      min="1"
                      value={pageLimit}
                      onChange={(e) => setPageLimit(e.target.value)}
                      onBlur={(e) => {
                        if (Number(e.target.value) <= 0) {
                          setPageLimit(1);
                        }
                      }}
                    />
                    <label htmlFor="page-limit-input">{pageWord}</label>
                  </div>
                )}
              </div>
            )}

          <Button
            type="btn-primary"
            className="scan-btn"
            onClick={handleScanButtonClicked}
            disabled={scanButtonIsClicked || isAbortingScan}
          >
            {scanButtonIsClicked || isAbortingScan ? (
              <LoadingSpinner></LoadingSpinner>
            ) : (
              "Scan"
            )}
          </Button>
        </div>

        {prevUrlErrorMessage && (
          <span id="url-error-message" className="error-text">
            {prevUrlErrorMessage}
          </span>
        )}
      </div>

      <AdvancedScanOptions
        isProxy={isProxy}
        scanTypeOptions={
          isCustomOptionChecked
            ? scanTypeOptions.filter(
                (option) =>
                  option !== scanTypeOptions[2] && option !== scanTypeOptions[3]
              )
            : scanTypeOptions.filter((option) => option !== scanTypeOptions[3])
        }
        fileTypesOptions={fileTypesOptions}
        viewportOptions={viewportOptions}
        deviceOptions={deviceOptions}
        advancedOptions={{
          ...advancedOptions,
          scanType: isCustomOptionChecked
            ? displayScanType
            : advancedOptions.scanType,
        }}
        setAdvancedOptions={(newOptions) => {
          if (!isCustomOptionChecked) {
            setAdvancedOptions(newOptions);
            setDisplayScanType(newOptions.scanType);
            setCachedNonFileScanType(newOptions.scanType);
          } else {
            setDisplayScanType(newOptions.scanType);
            setCachedNonFileScanType(newOptions.scanType);
            setAdvancedOptions({
              ...advancedOptions,
              ...newOptions,
              scanType: scanTypeOptions[3],
            });
          }
          setAllowedFileTypes(getAllowedFileTypes(newOptions.scanType));
        }}
        scanButtonIsClicked={scanButtonIsClicked}
        isCustomOptionChecked={isCustomOptionChecked}
      />
    </div>
  );
};

export default InitScanForm;
