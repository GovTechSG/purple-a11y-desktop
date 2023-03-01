import React from "react";
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

export default ErrorPage;