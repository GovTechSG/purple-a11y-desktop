import React, { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "../views/pages/HomePage";
import ResultPage from "../views/pages/ResultPage";
import HelpPage from "../views/pages/HelpPage";
import ErrorPage from "../views/pages/ErrorPage";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const AppRoutes = () => {
  const [scanId, setScanId] = useState(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [onlineOpen, setOnlineOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("offline", () => {
      if (onlineOpen) {
        setOnlineOpen(false);
      }
      setOfflineOpen(true);
    });
    window.addEventListener("online", () => {
      if (offlineOpen) {
        setOfflineOpen(false);
        setOnlineOpen(true);
      }
    });
  }, [offlineOpen, onlineOpen]);

  const handleOfflineClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOfflineOpen(false);
  };

  const handleOnlineClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOnlineOpen(false);
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage setScanId={setScanId} />} />
          <Route path="/result" element={<ResultPage scanId={scanId} />} />
          <Route path="/about" element={<HelpPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
      <Snackbar
        open={offlineOpen}
        onClose={handleOfflineClose}
        message="Test snackbar"
        sx={{ maxWidth: '50vw' }}
      >
        <Alert
          onClose={handleOfflineClose}
          severity="error"
          variant="filled"
          elevation={6}
          sx={{ alignItems: "center" }}
        >
          There is no internet connection. Some features may not work correctly. If a scan is ongoing, some pages may be skipped.
        </Alert>
      </Snackbar>
      <Snackbar
        open={onlineOpen}
        onClose={handleOnlineClose}
        message="Test snackbar"
        autoHideDuration={5000}
        sx={{ maxWidth: '50vw' }}
      >
        <Alert
          onClose={handleOnlineClose}
          severity="success"
          variant="filled"
          elevation={6}
          sx={{ alignItems: "center" }}
        >
          Back online!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppRoutes;
