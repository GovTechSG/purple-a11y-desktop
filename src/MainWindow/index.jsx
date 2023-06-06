import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import Button from "../common/components/Button";
import ConnectionNotification from "./ConnectionNotification";
import services from "../services";
import "./MainWindow.css";


const MainWindow = ({ appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);
  
  return (
    <>
      <ConnectionNotification />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                appVersion={appVersion}
                setCompletedScanId={setCompletedScanId}
              />
            }
          />
          <Route path="/scanning" element={<ScanningPage />} />
          <Route
            path="/result"
            element={<ResultPage completedScanId={completedScanId} />}
          />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
    </>
  );
}


export default MainWindow;
