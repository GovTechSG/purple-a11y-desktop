import React, { useEffect, useState } from "react";
import MainWindow from "./MainWindow";
import LaunchWindow from "./LaunchWindow";
import "./sgds.css";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [isProxy, setIsProxy] = useState(false);

  useEffect(() => {
    window.services.guiReady();
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s);
    });
    window.services.getVersionNumber((res) => {
      setAppVersion(res);
    });
    
    window.services.getIsProxy((res) => {
      setIsProxy(res)
    })
  }, []);

  if (status === "launch") {
    return <LaunchWindow />;
  }

  if (status === "ready") {
    return <MainWindow isProxy={isProxy} appVersion={appVersion} />;
  }

  return null;
}

export default App;
