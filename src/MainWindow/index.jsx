import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import OnboardingComponent from "./Onboarding/OnboardingComponent";
import ConnectionNotification from "./ConnectionNotification";
import "./MainWindow.css";
import CustomFlowPage from "./CustomFlow";

const MainWindow = ({ isProxy, appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);
  const [dataExistStatus, setDataExistStatus] = useState(null);

  useEffect(() => {
    console.log("user data exists?");
    window.services.userDataExists((status) => {
      console.log(status);
      setDataExistStatus(status);
    });
  }, []);

  if (dataExistStatus === "doesNotExist") {
    return (
      <OnboardingComponent
        setDataExistStatus={setDataExistStatus}
      />
    );
  }

  if (dataExistStatus === "exists") {
    console.log("hello");
    return (
      <>
        <ConnectionNotification />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  isProxy={isProxy}
                  appVersion={appVersion}
                  setCompletedScanId={setCompletedScanId}
                />
              }
            />
            <Route path="/custom_flow" element={<CustomFlowPage completedScanId={completedScanId} setCompletedScanId={setCompletedScanId}/>}></Route>
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
};

export default MainWindow;
