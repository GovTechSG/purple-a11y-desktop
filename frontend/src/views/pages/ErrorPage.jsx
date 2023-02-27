import React, { Component, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import "../../styles/ErrorPage.css";

const ErrorPage = () => {
  const location = useLocation();

  return (
    <div className="error-msg">
    {location.state?.message ? (
      <Typography variant="h1" color="primary">
        {location.state.message}
      </Typography>
    ) : (
      <Typography variant="h1" color="primary">
        An Error Occurred
      </Typography>
    )}

    <Typography variant="p">
      Go back <Link to="/">Home</Link> and try again.
    </Typography>
  </div>
  )
}

// ErrorPage.propTypes = {
//   match: PropTypes.object.isRequired,
// };

export default ErrorPage;