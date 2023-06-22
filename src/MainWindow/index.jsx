import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import OnboardingComponent from "./Onboarding/OnboardingComponent";
import ConnectionNotification from "./ConnectionNotification";
import "./MainWindow.css";


const MainWindow = ({ appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);
  const [dataExistStatus, setDataExistStatus] = useState(null);

  useEffect(() => {
    window.services.userDetailsExist((status) => {
      setDataExistStatus(status)
    })
  }, []);

  if (dataExistStatus === "doNotExist") {
    return (
      <OnboardingComponent setDataExistStatus={setDataExistStatus}/>
    )
  }

  if (dataExistStatus === "exist") {
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

  return null;
}


export default MainWindow;
