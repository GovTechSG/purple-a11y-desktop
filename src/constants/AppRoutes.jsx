import React, { useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "../views/pages/HomePage";
import ResultPage from "../views/pages/ResultPage";
import HelpPage from "../views/pages/HelpPage";
import ErrorPage from "../views/pages/ErrorPage";

const AppRoutes = () => {
  const [scanId, setScanId] = useState(null);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<HomePage setScanId={setScanId} />}
          />
          <Route
            path="/result"
            element={<ResultPage scanId={scanId} />}
          />
          <Route path="/about" element={<HelpPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default AppRoutes;
