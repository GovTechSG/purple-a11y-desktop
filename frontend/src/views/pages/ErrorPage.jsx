import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { withStyles } from "@mui/material/styles";
import "../../styles/ErrorPage.css";

const styles = (theme) => ({
  root: {
    height: "100vh",
  },
});

export class ErrorPage extends Component {

  render() {
    console.log(this.props.location.message)
    return (
      <div className='error-msg'>
        {this.props.location.message ?
          <Typography variant="h1" color="primary">{this.props.location.message}</Typography>
          : <Typography variant="h1" color="primary">An Error Occurred</Typography>}

        <Typography variant="p">Go back <Link to="/home">Home</Link> and try again.</Typography>
      </div>
    )
  }
}

ErrorPage.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter((withStyles(styles)(ErrorPage)));
