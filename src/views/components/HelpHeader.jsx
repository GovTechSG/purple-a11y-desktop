import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import "../../styles/HelpHeader.css";

const HelpHeader = () => {
  const navigate = useNavigate();
  
  const backHome = () => {
    navigate("/");
  };

  return (
    <div className="head">
      <h1 className="help-title">HATS Accessibility Testing Tool</h1>
      <h2 className="help-tagline">
        When we design for accessibility, everyone benefits.
      </h2>
      <Button
        className="scan-button"
        title="Scan your site here"
        action={backHome}
      />
    </div>
  );
};

export default HelpHeader;
