/* eslint-disable react/state-in-constructor */
import React from "react";
import Typography from "@mui/material/Typography";
import "../../styles/HomePage.css";
import DomainContainer from "../containers/DomainContainer";
import ToolTipButton from "../components/ToolTipButton";

const HomePage = ({ setScanId }) => {
  setScanId(null);
  
  return (
    <>
      <Typography component="div">
        <h1 className="header">HATS Accessibility Testing Tool</h1>
      </Typography>
      <DomainContainer setScanId={setScanId} />
      <div className="developed-text">Built by Accessiblity Enabling Team, GovTech</div>
      <div className="link-options">
        <ToolTipButton />
      </div>
    </>
  );
};

export default HomePage;
