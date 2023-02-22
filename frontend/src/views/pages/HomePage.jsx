/* eslint-disable react/state-in-constructor */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import "../../styles/HomePage.css";
import DomainContainer from "../containers/DomainContainer";
import ToolTipButton from "../components/ToolTipButton";

const HomePage = ({ setScanResults }) => {
  return (
    <>
      <Typography component="div">
        <h1 className="header">HATS Accessibility Testing Tool</h1>
      </Typography>
      <DomainContainer setScanResults={setScanResults} />
      <div className="developed-text">Built by GDS HATS Team</div>
      <div className="link-options">
        <ToolTipButton />
      </div>
    </>
  );
};

// HomePage.propTypes = {
//   match: PropTypes.object.isRequired,
// };

export default HomePage;
