import React, { useEffect, useState } from "react";
import "./styles/App.css";
import AppRoutes from "./constants/AppRoutes";
import LaunchWindow from "./views/components/LaunchWindow";

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    window.services.guiReady()
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s)
    });
  })

  if (status === "settingUp") {
    return (
      <LaunchWindow
        message="Setting Up Purple HATS"
        subMessage="This may take a while. Please do not close the application."
      />
    );
  }

  if (status === "checkingUpdates") {
    return <LaunchWindow message="Checking for Updates" />;
  }

  if (status === "updatingApp") {
    return (
      <LaunchWindow
        message="Updating to the Latest Version"
        subMessage="This may take a while. Please do not close the application."
      />
    );
  }

  if (status === "ready") {
    return (
      <div className="App">
        <AppRoutes />
      </div>
    );
  }

  return null;
}

export default App;
