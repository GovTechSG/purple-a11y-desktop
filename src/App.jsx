import React, { useEffect, useState } from "react";
import MainWindow from "./MainWindow";
import LaunchWindow from "./LaunchWindow";
import "./sgds.css";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [appVersionInfo, setAppVersionInfo] = useState({});
  const [isProxy, setIsProxy] = useState(false);

  useEffect(() => {
    window.services.guiReady();
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s);
    });

    window.services.getVersionInfo((appVersionInfo) => {
      setAppVersionInfo(appVersionInfo);
    })
    
    window.services.getIsProxy((res) => {
      setIsProxy(res)
    })
  }, []);

  if (status === "launch") {
    return <LaunchWindow />;
  }

  if (status === "ready") {
    return <MainWindow isProxy={isProxy} appVersionInfo={appVersionInfo} />;
  }

  return null;
}

export default App;
