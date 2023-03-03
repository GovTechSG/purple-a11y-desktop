import React, { useState } from "react";
import "../../styles/ToolTip.css";
import { Popper, Fade, Paper } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// eslint-disable-next-line
import { Link } from "react-router-dom";

const ToolTipButton = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState();
  const [title, setTitle] = useState("?");

  const handleClick = (newPlacement) => (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => placement !== newPlacement || !prev);
    setPlacement(newPlacement);

    if (title === "V") {
      setTitle("?");
    } else {
      setTitle("V");
    }
  };
  const handleTab = (e) => {
    // console.log("e:", e);
    localStorage.setItem("tabstore", Number(e));
  };

  return (
    <div>
      <button
        className="help-button"
        onClick={handleClick("top-end")}
        type={props.type}
        disabled={props.disabled}
      >
        {title === "?" ? "?" : <ExpandMoreIcon />}
      </button>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        modifiers={[{ name: "offset", options: { offset: [0, 9, 0] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <div className="intro-box">
                <p className="hi-title">Hi there!</p>
                <p className="hi-text">
                  Thank you for making your site more accessible.
                </p>
                <br />
              </div>
              <div className="about-box">
                <p className="info-title">About this tool</p>
                <p className="info-text">
                  This tool allows you to test your site for accessibility
                  issues and generate a report for your developers to understand
                  and act on.
                </p>
                <Link
                  className="read-more"
                  onClick={(e) => handleTab(0)}
                  to={{
                    pathname: "/about",
                  }}
                  target="_blank"
                >
                  {" "}
                  Read more
                </Link>
              </div>
              <div className="report-box">
                <p className="info-title">Report format</p>
                <p className="info-text">
                  Learn how to read the report
                  <Link
                    className="read-more"
                    onClick={(e) => handleTab(1)}
                    to={{
                      pathname: "/about",
                    }}
                    target="_blank"
                  >
                    {" "}
                    here
                  </Link>
                </p>
              </div>
              <div className="feedback-box" align="center">
                <a
                  className="read-more"
                  href="mailto:enquiries_HATS@tech.gov.sg"
                >
                  Give us feedback
                </a>
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default ToolTipButton;
