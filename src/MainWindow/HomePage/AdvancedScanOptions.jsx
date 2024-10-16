import { useState, useRef, useEffect } from 'react'
import Button from '../../common/components/Button'
import SelectField from './SelectField'
import DownloadFolderDropdown from '../../common/components/DownloadFolderDropdown'
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up-purple.svg'
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down-white.svg'
import questionMarkIcon from '../../assets/question-mark-light-grey.svg'
import ButtonSvgIcon from '../../common/components/ButtonSvgIcon'
import ToolTip from '../../common/components/ToolTip'
import { getDefaultAdvancedOptions } from '../../common/constants'
import purpleEditIcon from '../../assets/edit-pencil-purple.svg'
import greyEditIcon from '../../assets/edit-pencil-grey.svg'

const AdvancedScanOptions = ({
  isProxy,
  scanTypeOptions,
  fileTypesOptions,
  viewportOptions,
  deviceOptions,
  advancedOptions,
  setAdvancedOptions,
  scanButtonIsClicked,
  isFileOptionChecked,
}) => {
  const [openAdvancedOptionsMenu, setOpenAdvancedOptionsMenu] = useState(false)
  const [advancedOptionsDirty, setAdvancedOptionsDirty] = useState(false)
  const [isMaxConcurrencyMouseEvent, setIsMaxConcurrencyMouseEvent] =
    useState(false)
  const [showMaxConcurrencyTooltip, setShowMaxConcurrencyTooltip] =
    useState(false)
  const [isSafeModeMouseEvent, setIsSafeModeMouseEvent] = useState(false)
  const [showSafeModeTooltip, setShowSafeModeTooltip] = useState(false)

  const menu = useRef()

  useEffect(() => {
    if (openAdvancedOptionsMenu) {
      const menuElem = document.getElementById('advanced-options-menu')
      const menuInputElemList = menuElem.querySelectorAll(
        'input, select, button'
      )
      menuInputElemList.forEach((elem) => (elem.disabled = scanButtonIsClicked))

      const downloadDropdownEditIcon = document.querySelector(
        '.download-dropdown-btn .change-download-btn img'
      )
      downloadDropdownEditIcon.src = scanButtonIsClicked
        ? greyEditIcon
        : purpleEditIcon
    }
  }, [openAdvancedOptionsMenu, scanButtonIsClicked])

  const handleToggleMenu = () => {
    if (!openAdvancedOptionsMenu) {
      setOpenAdvancedOptionsMenu(true)
    } else {
      menu.current.style.animationName = 'button-fade-out'
      setTimeout(() => setOpenAdvancedOptionsMenu(false), 200)
    }
  }

  const handleMaxConcurrencyOnFocus = () => {
    if (!isMaxConcurrencyMouseEvent) {
      setShowMaxConcurrencyTooltip(true)
    }
  }

  const handleMaxConcurrencyOnMouseEnter = () => {
    setShowMaxConcurrencyTooltip(false)
    setIsMaxConcurrencyMouseEvent(true)
  }

  const handleSafeModeOnFocus = () => {
    if (!isSafeModeMouseEvent) {
      setShowSafeModeTooltip(true)
    }
  }

  const handleSafeModeOnMouseEnter = () => {
    setShowSafeModeTooltip(false)
    setIsSafeModeMouseEvent(true)
  }

  /*
  by default, new value of the selected option will be set to event.target.value
  if the new value should be something else, provide a function to overrideVal that returns
  the intended value. Function should be in the format (event) => {...; return valueToBeReturned;}
  */
  const handleSetAdvancedOption =
    (option, overrideVal = null) =>
    (event) => {
      let val
      if (overrideVal) {
        val = overrideVal(event)
      } else {
        val = event.target.value
      }

      const newOptions = { ...advancedOptions }
      newOptions[option] = val
      setAdvancedOptions(newOptions)

      // check if new options are the default
      const defaultAdvancedOptions = getDefaultAdvancedOptions(isProxy)
      const isNewOptionsDefault = Object.keys(defaultAdvancedOptions).reduce(
        (isDefaultSoFar, key) => {
          return (
            isDefaultSoFar && defaultAdvancedOptions[key] === newOptions[key]
          )
        },
        true
      )

      setAdvancedOptionsDirty(!isNewOptionsDefault)
    }

  return (
    <div>
      <div id="advanced-options-toggle-button">
        {/* TODO: Fix toggle bold text for Advanced scan options
        Add toggle close when clicking outside modal*/}
        <Button
          type="btn-link"
          className={'purple-text' + (advancedOptionsDirty ? ' bold-text' : '')}
          onClick={handleToggleMenu}
        >
          Advanced scan options{' '}
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
            onChange={handleSetAdvancedOption('scanType')}
          />
          <SelectField
            id="viewport-type-dropdown"
            label="Viewport:"
            initialValue={advancedOptions.viewport}
            options={Object.values(viewportOptions)}
            onChange={handleSetAdvancedOption('viewport')}
          />
          {advancedOptions.viewport === viewportOptions.specific &&
            !isProxy && (
              <SelectField
                id="specific-device-dropdown"
                label="Device:"
                initialValue={advancedOptions.device}
                options={deviceOptions}
                onChange={handleSetAdvancedOption('device')}
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
                onChange={handleSetAdvancedOption('viewportWidth')}
                onBlur={handleSetAdvancedOption('viewportWidth', (e) => {
                  if (Number(e.target.value) < 320) {
                    return 320
                  }
                  if (Number(e.target.value) > 1080) {
                    return 1080
                  }
                  return e.target.value
                })}
                value={advancedOptions.viewportWidth}
              />
            </div>
          )}
          {advancedOptions.scanType !== scanTypeOptions[2] && (
            <SelectField
              id="file-type-dropdown"
              label="File Type:"
              initialValue={advancedOptions.fileTypes}
              options={fileTypesOptions}
              onChange={handleSetAdvancedOption('fileTypes')}
            />
          )}
          <div
            id="screenshots-toggle-group"
            class="advanced-options-toggle-group"
          >
            <input
              type="checkbox"
              id="screenshots-toggle"
              class="advanced-options-toggle"
              aria-describedby="screenshots-tooltip"
              checked={advancedOptions.includeScreenshots}
              onChange={handleSetAdvancedOption(
                'includeScreenshots',
                (e) => e.target.checked
              )}
            />
            <label htmlFor="screenshots-toggle">Include screenshots</label>
          </div>
          {!isFileOptionChecked &&
            advancedOptions.scanType === scanTypeOptions[0] && (
              <div
                id="subdomain-toggle-group"
                class="advanced-options-toggle-group"
              >
                <input
                  type="checkbox"
                  id="subdomain-toggle"
                  class="advanced-options-toggle"
                  checked={advancedOptions.includeSubdomains}
                  onChange={handleSetAdvancedOption(
                    'includeSubdomains',
                    (e) => e.target.checked
                  )}
                />
                <label htmlFor="subdomain-toggle">
                  Allow subdomains for scans
                </label>
              </div>
            )}

          {advancedOptions.scanType !== scanTypeOptions[2] && (
            <>
              <div
                id="max-concurrency-toggle-group"
                class="advanced-options-toggle-group"
              >
                <input
                  type="checkbox"
                  id="max-concurrency-toggle"
                  class="advanced-options-toggle"
                  aria-describedby="max-concurrency-tooltip"
                  checked={advancedOptions.maxConcurrency}
                  onFocus={() => handleMaxConcurrencyOnFocus()}
                  onBlur={() => setShowMaxConcurrencyTooltip(false)}
                  onMouseEnter={() => handleMaxConcurrencyOnMouseEnter()}
                  onMouseLeave={() => setIsMaxConcurrencyMouseEvent(false)}
                  onChange={handleSetAdvancedOption(
                    'maxConcurrency',
                    (e) => e.target.checked
                  )}
                />
                <label htmlFor="max-concurrency-toggle">Slow Scan Mode</label>
                <div className="custom-tooltip-container">
                  <ToolTip
                    description={
                      'Scan 1 page at a time instead of multiple pages concurrently.'
                    }
                    id="max-concurrency-tooltip"
                    showToolTip={showMaxConcurrencyTooltip}
                  />
                  <img
                    className="tooltip-img"
                    src={questionMarkIcon}
                    aria-describedby="max-concurrency-tooltip"
                    checked={advancedOptions.maxConcurrency}
                    onFocus={() => handleMaxConcurrencyOnFocus()}
                    onBlur={() => setShowMaxConcurrencyTooltip(false)}
                    onMouseEnter={() => setShowMaxConcurrencyTooltip(true)}
                    onMouseLeave={() => setShowMaxConcurrencyTooltip(false)}
                    alt="tooltip icon for slow scan mode"
                  />
                </div>
              </div>
              <div
                id="safe-mode-toggle-group"
                class="advanced-options-toggle-group"
              >
                <input
                  type="checkbox"
                  id="safe-mode-toggle"
                  class="advanced-options-toggle"
                  onFocus={() => handleSafeModeOnFocus()}
                  onBlur={() => setShowSafeModeTooltip(false)}
                  onMouseEnter={() => handleSafeModeOnMouseEnter()}
                  onMouseLeave={() => setIsSafeModeMouseEvent(false)}
                  aria-describedby="safe-mode-tooltip"
                  checked={advancedOptions.safeMode}
                  onChange={handleSetAdvancedOption(
                    'safeMode',
                    (e) => e.target.checked
                  )}
                />
                <label htmlFor="safe-mode-toggle">Safe Scan Mode</label>
                <div className="custom-tooltip-container">
                  <ToolTip
                    description={
                      'Disable dynamically clicking of page buttons and links to find links, which resolve issues on some websites.'
                    }
                    id="safe-mode-tooltip"
                    showToolTip={showSafeModeTooltip}
                  />
                  <img
                    className="tooltip-img"
                    src={questionMarkIcon}
                    checked={advancedOptions.safeMode}
                    aria-describedby="safe-mode-tooltip"
                    onFocus={() => handleSafeModeOnFocus()}
                    onBlur={() => setShowSafeModeTooltip(false)}
                    onMouseEnter={() => setShowSafeModeTooltip(true)}
                    onMouseLeave={() => setShowSafeModeTooltip(false)}
                    alt="tooltip icon for safe scan mode"
                  />
                </div>
              </div>
              <div
                id="follow-robots-toggle-group"
                class="advanced-options-toggle-group"
              >
                <input
                  type="checkbox"
                  id="follow-robots-toggle"
                  class="advanced-options-toggle"
                  aria-describedby="follow-robots-tooltip"
                  checked={advancedOptions.followRobots}
                  onChange={handleSetAdvancedOption(
                    'followRobots',
                    (e) => e.target.checked
                  )}
                />
                <label htmlFor="follow-robots-toggle">
                  Adhere to robots.txt
                </label>
              </div>
            </>
          )}
          <hr />
          <div className="user-input-group">
            <label id="download-folder-label" className="bold-text">
              Download:
            </label>
            <DownloadFolderDropdown></DownloadFolderDropdown>
          </div>
          {/* <div id="scan-in-background-toggle-group">
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
          </div> */}
        </div>
      )}
    </div>
  )
}

export default AdvancedScanOptions
