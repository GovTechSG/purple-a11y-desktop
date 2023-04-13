import { useState } from "react";
import Button from "../../common/components/Button";
import SelectField from "./SelectField";

const AdvancedScanOptions = ({
  scanTypeOptions,
  viewportOptions,
  deviceOptions,
  advancedOptions,
  setAdvancedOptions,
}) => {
  const [openAdvancedOptionsMenu, setOpenAdvancedOptionsMenu] = useState(false);
  const [advancedOptionsDirty, setAdvancedOptionsDirty] = useState(false);

  /*
  by default, new value of the selected option will be set to event.target.value
  if the new value should be something else, provide a function to overrideVal that returns
  the intended value. Function should be in the format (event) => {...; return valueToBeReturned;}
  */
  const handleSetAdvancedOption =
    (option, overrideVal = null) =>
    (event) => {
      let val;
      if (overrideVal) {
        val = overrideVal(event);
      } else {
        val = event.target.value;
      }

      const newOptions = { ...advancedOptions };
      newOptions[option] = val;
      setAdvancedOptions(newOptions);

      if (!advancedOptionsDirty) {
        setAdvancedOptionsDirty(true);
      }
    };

  return (
    <div id="advanced-options-group">
      <div id="advanced-options-toggle-button">
        <Button
          type="transparent"
          className={"purple-text" + (advancedOptionsDirty ? " bold-text" : "")}
          onClick={() => setOpenAdvancedOptionsMenu(!openAdvancedOptionsMenu)}
        >
          Advanced scan options{" "}
          {openAdvancedOptionsMenu ? (
            <i className="bi bi-chevron-up" />
          ) : (
            <i className="bi bi-chevron-down" />
          )}
        </Button>
      </div>
      {openAdvancedOptionsMenu && (
        <div id="advanced-options-menu">
          <SelectField
            id="scan-type-dropdown"
            label="Scan Type:"
            initialValue={advancedOptions.scanType}
            options={scanTypeOptions}
            onChange={handleSetAdvancedOption("scanType")}
          />
          <SelectField
            id="viewport-type-dropdown"
            label="Viewport:"
            initialValue={advancedOptions.viewport}
            options={viewportOptions}
            onChange={handleSetAdvancedOption("viewport")}
          />
          {advancedOptions.viewport === viewportOptions[2] && (
            <SelectField
              id="specific-device-dropdown"
              label="Device:"
              initialValue={advancedOptions.device}
              options={deviceOptions}
              onChange={handleSetAdvancedOption("device")}
            />
          )}
          {advancedOptions.viewport === viewportOptions[3] && (
            <div className="user-input-group">
              <label htmlFor="viewport-width-input" className="bold-text">
                Width (px)
              </label>
              <input
                type="number"
                id="viewport-width-input"
                className="input-field"
                step="50"
                min="1"
                required
                onChange={handleSetAdvancedOption("viewportWidth")}
                onBlur={handleSetAdvancedOption("viewportWidth", (e) => {
                  if (Number(e.target.value) <= 0) {
                    return 1;
                  }
                  return e.target.value;
                })}
                value={advancedOptions.viewportWidth}
              />
            </div>
          )}
          <hr />
          <div id="scan-in-background-toggle-group">
            <input
              type="checkbox"
              id="scan-in-background-toggle"
              checked={advancedOptions.scanInBackground}
              onChange={handleSetAdvancedOption(
                "scanInBackground",
                (e) => e.target.checked
              )}
            />
            <label htmlFor="scan-in-background-toggle">
              Scan in background
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedScanOptions;
