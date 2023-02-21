import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter, Route } from "react-router-dom";
import Loading from "../components/Loading"
import "../../styles/Scanning.css";
import "../../styles/ResultPage.css";
import Button from "../components/Button";
import { ErrorPage } from "./ErrorPage";
import ToolTipButton from "../components/ToolTipButton";

export class ResultPage extends Component {
  state = {
    loading: true,
  };

  downloadFile(data) {
    let blob = new Blob([data], { type: "text/plain;charset=utf-8" })
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'report.html'
    link.click()

  }

  render() {
    console.log(this.props.location);
    console.log(this.props.location.state);

    if (this.props.location.state === 'scanning') {
      return (
        <>
          <Loading className="loader" />
          <div className="doyouknow">
            <div className="tip-card">
              <div className="tip-title">Do you know?</div>
              <p className="tip">Do you know many assistive technologies rely on keyboard-only navigation? <br /><br />
                So for a website to be accessible, it must work without the use of a mouse.</p></div>
          </div>
          <div className="developed-text">Built by GDS HATS Team</div>
          <div className="link-options">
            <ToolTipButton />
          </div>
        </>
      );
    } else if (this.props.location.state === undefined) {
      this.props.history.push({
        pathname: "/error",
      });
      return (<Route path="/error" component={ErrorPage} />)
      // <ErrorPage />)
    } else {
      return (<>
        <div variant="h1" className="scan-complete">Scan completed</div>
        <div className="download-div">
          <Button type="download"
            className={"download-button"}
            title={"Download report"}
            id="downloadButton"
            action={() => this.downloadFile(this.props.location.state.data)}
          />
          <div className="scan-link">
            <a href="/">Scan again</a>
          </div>
        </div>
        <div className="developed-text">Built by GDS HATS Team</div>
        <div className="link-options">
          <ToolTipButton />
        </div>
      </>)
    }
  }
}

ResultPage.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter(ResultPage);
