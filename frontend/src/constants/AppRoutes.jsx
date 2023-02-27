import React, { useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "../views/pages/HomePage";
import ResultPage from "../views/pages/ResultPage";
import HelpPage from "../views/pages/HelpPage";
import ErrorPage from "../views/pages/ErrorPage";

const AppRoutes = () => {
  const [scanResults, setScanResults] = useState(null);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<HomePage setScanResults={setScanResults} />}
          />
          <Route
            path="/result"
            element={<ResultPage scanResults={scanResults} />}
          />
          <Route path="/about" element={<HelpPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default AppRoutes;
