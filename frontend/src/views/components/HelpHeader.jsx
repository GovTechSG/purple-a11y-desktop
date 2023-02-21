import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Button from "../components/Button";
import '../../styles/HelpHeader.css';

export class HelpHeader extends Component {

  backHome = () => {
    this.props.history.push({
      pathname: '/home'
    })
  }

  render() {
    return (
      <div className='head'>
        <h1 className="help-title">HATS Accessibility Testing Tool</h1>
        <h2 className="help-tagline">When we design for accessibility, everyone benefits.</h2>
        <Button
          className="scan-button"
          title="Scan your site here"
          action={this.backHome}
        />
      </div>
    );
  }
}

export default withRouter((HelpHeader));
