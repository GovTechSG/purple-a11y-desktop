import React, { useState } from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Navigation from "../views/components/Navigation";
import HomePage from "../views/pages/HomePage";
import ResultPage from "../views/pages/ResultPage";
import HelpPage from "../views/pages/HelpPage";
import ErrorPage from "../views/pages/ErrorPage";

const AppRoutes = () => {
  const [scanResults, setScanResults] = useState(null);

  return (
    <>
      <Router>
        <Navigation>
          <Routes>
            <Route
              path="/"
              element={<HomePage setScanResults={setScanResults} />}
            />
            <Route
              path="/home"
              element={<HomePage setScanResults={setScanResults} />}
            />
            <Route
              path="/result"
              element={<ResultPage scanResults={scanResults} />}
            />
            <Route path="/about" element={<HelpPage />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </Navigation>
      </Router>
    </>
  );
};

export default AppRoutes;
