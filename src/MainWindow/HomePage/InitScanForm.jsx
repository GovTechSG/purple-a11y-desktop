import { useState } from "react";
import Button from "../../common/components/Button";
import AdvancedScanOptions from "./AdvancedScanOptions";
import { scanTypes, viewportTypes, devices } from "../../common/constants";

const InitScanForm = ({ startScan }) => {
  const [openPageLimitAdjuster, setOpenPageLimitAdjuster] = useState(false);

  const [scanUrl, setScanUrl] = useState("https://");
  const [pageLimit, setPageLimit] = useState("100");

  const scanTypeOptions = Object.keys(scanTypes);
  const viewportOptions = viewportTypes;
  const deviceOptions = Object.keys(devices);

  const [advancedOptions, setAdvancedOptions] = useState({
    scanType: scanTypeOptions[0],
    viewport: viewportOptions[0],
    device: deviceOptions[0],
    viewportWidth: "1",
    scanInBackground: false,
  });

  const handleScanButtonClicked = () => {
    startScan({ scanUrl, pageLimit, ...advancedOptions });
  };

  // styles are in HomePage.scss
  return (
    <div id="init-scan-form">
      <label htmlFor="url-input" id="url-bar-label">
        Enter your URL to get started
      </label>
      <div id="url-bar">
        <input
          id="url-input"
          type="text"
          value={scanUrl}
          onChange={(e) => setScanUrl(e.target.value)}
        />
        {advancedOptions.scanType !== scanTypeOptions[2] && (
          <div>
            <Button
              type="transparent"
              id="page-limit-toggle-button"
              onClick={() => setOpenPageLimitAdjuster(!openPageLimitAdjuster)}
            >
              capped at{" "}
              <span className="purple-text">
                {pageLimit} pages <i className="bi bi-chevron-down" />
              </span>
            </Button>
            {openPageLimitAdjuster && (
              <input
                type="number"
                id="page-limit-adjuster"
                step="10"
                min="0"
                value={pageLimit}
                onChange={(e) => setPageLimit(e.target.value)}
              />
            )}
          </div>
        )}
        <Button type="primary" onClick={handleScanButtonClicked}>
          Scan
        </Button>
      </div>
      <AdvancedScanOptions
        scanTypeOptions={scanTypeOptions}
        viewportOptions={viewportOptions}
        deviceOptions={deviceOptions}
        advancedOptions={advancedOptions}
        setAdvancedOptions={setAdvancedOptions}
      />
    </div>
  );
};

export default InitScanForm;
