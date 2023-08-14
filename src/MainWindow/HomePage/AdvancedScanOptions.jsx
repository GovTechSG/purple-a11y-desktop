import { useState, useRef, useEffect } from "react";
import Button from "../../common/components/Button";
import SelectField from "./SelectField";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import questionMarkIcon from "../../assets/question-mark.svg";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import ToolTip from "../../common/components/ToolTip";

const AdvancedScanOptions = ({
  isProxy,
  scanTypeOptions,
  viewportOptions,
  deviceOptions,
  advancedOptions,
  setAdvancedOptions,
}) => {
  const [openAdvancedOptionsMenu, setOpenAdvancedOptionsMenu] = useState(false);
  const [advancedOptionsDirty, setAdvancedOptionsDirty] = useState(false);
  const [isMaxConcurrencyMouseEvent, setIsMaxConcurrencyMouseEvent] = useState(false);
  const [showMaxConcurrencyTooltip, setShowMaxConcurrencyTooltip] = useState(false);
  const [isFalsePositiveMouseEvent, setIsFalsePositiveMouseEvent] = useState(false);
  const [showFalsePositiveTooltip, setShowFalsePositiveTooltip] = useState(false);
  const menu = useRef();

  const handleToggleMenu = () => {
    if (!openAdvancedOptionsMenu) {
      setOpenAdvancedOptionsMenu(true);
    } else {
      menu.current.style.animationName = "button-fade-out";
      setTimeout(() => setOpenAdvancedOptionsMenu(false), 200);
    }
  };

  const handleMaxConcurrencyOnFocus = () => {
    if (!isMaxConcurrencyMouseEvent) {
      setShowMaxConcurrencyTooltip(true); 
    }
  }

  const handleMaxConcurrencyOnMouseEnter = () => {
    setShowMaxConcurrencyTooltip(false);
    setIsMaxConcurrencyMouseEvent(true); 
  }

  const handleFalsePositiveOnFocus = () => {
    if (!isFalsePositiveMouseEvent) {
      setShowFalsePositiveTooltip(true);
    }
  }

  const handleFalsePositiveOnMouseEnter = () => {
    setShowFalsePositiveTooltip(false); 
    setIsFalsePositiveMouseEvent(true);
  }

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

      if (
        newOptions.scanType === scanTypeOptions[0] &&
        newOptions.viewport === viewportOptions.desktop
      ) {
        setAdvancedOptionsDirty(false);
      } else {
        setAdvancedOptionsDirty(true);
      }
    };

  return (
    <div>
      <div id="advanced-options-toggle-button">
        <Button
          type="transparent"
          className={"purple-text" + (advancedOptionsDirty ? " bold-text" : "")}
          onClick={handleToggleMenu}
        >
          Advanced scan options{" "}
          {openAdvancedOptionsMenu ? (
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
        </Button>
      </div>
      {openAdvancedOptionsMenu && (
        <div id="advanced-options-menu" ref={menu}>
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
            options={Object.values(viewportOptions)}
            onChange={handleSetAdvancedOption("viewport")}
          />
          {advancedOptions.viewport === viewportOptions.specific && !isProxy && (
            <SelectField
              id="specific-device-dropdown"
              label="Device:"
              initialValue={advancedOptions.device}
              options={deviceOptions}
              onChange={handleSetAdvancedOption("device")}
            />
          )}
          {advancedOptions.viewport === viewportOptions.custom && (
            <div className="user-input-group">
              <label htmlFor="viewport-width-input" className="bold-text">
                Width (px)
              </label>
              <input
                type="number"
                id="viewport-width-input"
                className="input-field"
                step="10"
                min="320"
                max="1080"
                required
                onChange={handleSetAdvancedOption("viewportWidth")}
                onBlur={handleSetAdvancedOption("viewportWidth", (e) => {
                  if (Number(e.target.value) < 320) {
                    return 320;
                  }
                  if (Number(e.target.value) > 1080) {
                    return 1080;
                  }
                  return e.target.value;
                })}
                value={advancedOptions.viewportWidth}
              />
            </div>
          )}
          <hr />
          <div id="max-concurrency-toggle-group">
            <input
              type="checkbox"
              id="max-concurrency-toggle"
              aria-describedby='max-concurrency-tooltip'
              checked={advancedOptions.maxConcurrency}
              onFocus={() => handleMaxConcurrencyOnFocus()}
              onBlur={() => setShowMaxConcurrencyTooltip(false)}
              onMouseEnter={() => handleMaxConcurrencyOnMouseEnter()}
              onMouseLeave={() => setIsMaxConcurrencyMouseEvent(false)}
              onChange={handleSetAdvancedOption(
                "maxConcurrency",
                (e) => e.target.checked
              )}
            />
            <label htmlFor="max-concurrency-toggle">
              Slow Scan Mode
            </label>
            <div className="custom-tooltip-container">
              <ToolTip 
                description={'Scan 1 page at a time instead of multiple pages concurrently.'} 
                id='max-concurrency-tooltip'
                showToolTip={showMaxConcurrencyTooltip}
              />
              <img 
                className='tooltip-img' 
                src={questionMarkIcon} 
                aria-describedby='max-concurrency-tooltip' 
                onMouseEnter={() => setShowMaxConcurrencyTooltip(true)} 
                onMouseLeave={() => setShowMaxConcurrencyTooltip(false)} 
                alt="tooltip icon for slow scan mode"
              />
            </div>
          </div>
          <div id='false-positive-toggle-group'>
              <input 
                type="checkbox"
                id="false-positive-toggle" 
                aria-describedby="false-positive-tooltip"
                checked={advancedOptions.falsePositive}
                onFocus={() => handleFalsePositiveOnFocus()}
                onBlur={() => setShowFalsePositiveTooltip(false)}
                onMouseEnter={() => handleFalsePositiveOnMouseEnter()}
                onMouseLeave={() => setIsFalsePositiveMouseEvent(false)}
                onChange={handleSetAdvancedOption(
                  "falsePositive", 
                  (e) => e.target.checked
                )} 
              /> 
              <label htmlFor="false-positive-toggle">
                False Positive Items
              </label>
              <div className="custom-tooltip-container">
                <ToolTip 
                  description={'Display false positive items that will require manual review.'} 
                  id='false-positive-tooltip'
                  showToolTip={showFalsePositiveTooltip}
                />
                <img 
                  className='tooltip-img' 
                  src={questionMarkIcon} 
                  aria-describedby='false-positive-tooltip' 
                  onMouseEnter={() => setShowFalsePositiveTooltip(true)} 
                  onMouseLeave={() => setShowFalsePositiveTooltip(false)} 
                  alt="tooltip icon for false positive"/>
            </div>
          </div>
          {!isProxy && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedScanOptions;
