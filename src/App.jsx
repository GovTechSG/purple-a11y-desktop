import React, { useEffect, useState } from "react";
import MainWindow from "./MainWindow";
import LaunchWindow from "./LaunchWindow";
import "./sgds.css";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [isLatestVersion, setIsLatestVersion] = useState(false);
  const [isProxy, setIsProxy] = useState(false);

  useEffect(() => {
    window.services.guiReady();
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s);
    });

    window.services.getVersionInfo(({ appVersion, isLatest }) => {
      setAppVersion(appVersion);
      setIsLatestVersion(isLatest);
    })
    
    window.services.getIsProxy((res) => {
      setIsProxy(res)
    })
  }, []);

  if (status === "launch") {
    return <LaunchWindow />;
  }

  if (status === "ready") {
    return <MainWindow isProxy={isProxy} appVersion={appVersion} isLatestVersion={isLatestVersion} />;
  }

  return null;
}

export default App;
