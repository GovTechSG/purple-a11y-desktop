/* eslint-disable react/state-in-constructor */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { withStyles } from "@mui/material/styles";
import "../../styles/HomePage.css";
import DomainContainer from "../containers/DomainContainer"
import ToolTipButton from "../components/ToolTipButton";

const styles = (theme) => ({
  root: {
    height: "100vh",
    background: "#FCFBFE",
  },
});

class HomePage extends Component {

  state = {
    loading: true,
  };

  openHelp = () => {
    this.props.history.push({
      pathname: '/about'
    })
  }

  render() {
    return (
      <>
        <Typography component="div">
          <h1 className="header">HATS Accessibility Testing Tool</h1>
        </Typography>
        <DomainContainer />
        <div className="developed-text">Built by GDS HATS Team</div>
        <div className="link-options">
          <ToolTipButton />
        </div>
      </>
    );
  }
}

HomePage.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter((withStyles(styles)(HomePage)));
