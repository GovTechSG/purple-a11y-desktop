import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Select from "../components/Select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DomainContainer.css";
import { startScan } from "../../services";
import MuiButton from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Popper from "@mui/material/Popper";
import Card from "@mui/material/Card";
import SettingsIcon from "@mui/icons-material/Settings";
import { devices } from "../../constants/constants";

const validUrlRegex = RegExp(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
  return valid;
};

function DomainContainer({ setScanId }) {
  const [state, setState] = useState({
    domain: "",
    scanMethod: "Website",
  });
  const [error, setError] = useState("");
  const [touch, setTouch] = useState(false);

  const [maxPages, setMaxPages] = useState("100");
  const [deviceToEmulate, setDeviceToEmulate] = useState("Desktop");
  const [landscapeMode, setLandscapeMode] = useState(true);
  const [customViewportWidth, setCustomViewportWidth] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!validUrlRegex.test(state.domain) && touch === true) {
      setError("Domain is not valid");
    } else {
      setError("");
    }
  }, [state, touch]);

  const openAdvancedOptions = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const closeAdvancedOptions = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handlePageLimitChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    const parsedNum = Number(input);
    if (!Number.isInteger(parsedNum)) {
      return;
    }

    if (parsedNum <= 0) {
      setMaxPages("1");
    } else {
      setMaxPages(input);
    }
  };

  const handleViewportWidthChange = (event) => {
    event.preventDefault();
    const input = event.target.value;
    const parsedNum = Number(input);
    if (parsedNum <= 0) {
      setCustomViewportWidth("1");
    } else {
      setCustomViewportWidth(input);
    }
  };

  const handleTouch = () => {
    setTouch(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(error)) {
      console.error("Invalid Form");
      return;
    }

    let customDevice =
      deviceToEmulate === devices[0]
        ? null
        : deviceToEmulate.replaceAll(" ", "_");

    if (customDevice && customDevice !== devices[1] && landscapeMode) {
      customDevice += "_landscape";
    }

    const viewportWidth = customDevice ? null : customViewportWidth;

    navigate("/result", { state: "scanning" });

    const scanArgs = {
      scanType: state.scanMethod.split(" ")[0].toLowerCase(),
      url: state.domain,
      customDevice,
      viewportWidth,
    }

    if (state.scanMethod !== 'Custom Flow') {
      scanArgs.maxPages = maxPages;
    }

    const response = await startScan(scanArgs);

    if (response.success) {
      setScanId(response.scanId);
    } else {
      navigate("/error", { state: { message: response.message } });
    }
  };

  return (
    <>
      <div className="input-fields" style={{ paddingBottom: "14px" }}>
        <div className="select-input">
          <Select
            name={"scanMethod"}
            title={"Scan Type"}
            options={["Website", "Sitemap", "Custom Flow"]}
            value={state.scanMethod}
            placeholder={
              state.scanMethod === "Website"
                ? "https://www.hive.gov.sg"
                : "https://www.hive.gov.sg/sitemap.xml"
            }
            handleChange={(e) =>
              setState({ ...state, scanMethod: e.target.value })
            }
            hideLabel
          />
          <Input
            type={"text"}
            name={"domain"}
            value={state.domain}
            placeholder={
              state.scanMethod !== "Sitemap"
                ? "https://www.hive.gov.sg"
                : "https://www.hive.gov.sg/sitemap.xml"
            }
            handleChange={(e) => setState({ ...state, domain: e.target.value })}
            onBlur={handleTouch}
          />
          <div>
            <MuiButton
              sx={{
                background: "#4E42DA",
                borderRadius: 0,
                height: "46px",
                minWidth: "46px",
                color: "#FFF",
                "&:hover": {
                  background: "#4E42DA",
                },
              }}
              onClick={openAdvancedOptions}
            >
              <SettingsIcon />
            </MuiButton>
            <Popper
              open={open}
              anchorEl={anchorEl}
              placement="bottom-end"
              transition
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Card sx={{ p: 3 }}>
                    {state.scanMethod !== "Custom Flow" && (
                      <>
                        <label for="pages-to-scan" style={{ display: "block" }}>
                          Max Pages to Scan
                        </label>
                        <input
                          type="number"
                          id="pages-to-scan"
                          step="10"
                          onChange={handlePageLimitChange}
                          value={maxPages}
                          style={{
                            width: "100%",
                            padding: "8px 8px",
                            lineHeight: "0",
                          }}
                        />
                      </>
                    )}
                    <label for="device-to-emulate" style={{ display: "block" }}>
                      Device to Emulate
                    </label>
                    <select
                      value={deviceToEmulate}
                      onChange={(e) => setDeviceToEmulate(e.target.value)}
                      style={{ width: "100%", padding: "8px 8px" }}
                    >
                      {devices.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {deviceToEmulate !== devices[0] &&
                      deviceToEmulate !== devices[1] && (
                        <>
                          <label for="landscapeMode">
                            <input
                              type="checkbox"
                              id="landscapeMode"
                              checked={landscapeMode}
                              onChange={() => setLandscapeMode(!landscapeMode)}
                              style={{
                                marginRight: "4px",
                              }}
                            />
                            Landscape
                          </label>
                        </>
                      )}
                    {deviceToEmulate === devices[0] && (
                      <>
                        <label
                          for="viewport-width"
                          style={{ display: "block" }}
                        >
                          Viewport Width (px)
                        </label>
                        <input
                          type="number"
                          id="viewport-width"
                          step="1"
                          onChange={handleViewportWidthChange}
                          value={customViewportWidth}
                          style={{
                            width: "100%",
                            padding: "8px 8px",
                            lineHeight: "0",
                          }}
                        />
                      </>
                    )}
                    <Button
                      style={{ display: "block" }}
                      className="button-field"
                      title="Confirm"
                      action={closeAdvancedOptions}
                    />
                  </Card>
                </Fade>
              )}
            </Popper>
          </div>
        </div>

        <div className="error">{error}</div>
      </div>
      <p className="btn-area">
        <Button
          type="submit"
          action={handleFormSubmit}
          className={"button-field"}
          title={"Scan Site"}
          disabled={!state.domain || error}
        />
      </p>
    </>
  );
}

export default DomainContainer;
