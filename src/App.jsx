import React, { useState } from "react";
import "./styles/App.css";
import AppRoutes from "./constants/AppRoutes";
import LaunchWindow from "./views/components/LaunchWindow";

function App() {
  const [status, setStatus] = useState(null);

  window.services.appStatus((s) => setStatus(s));

  if (status === "settingUp") {
    return <LaunchWindow message="Setting Up Purple HATS" />;
  }

  if (status === "checkingUpdates") {
    return <LaunchWindow message="Checking for Updates" />;
  }

  if (status === "updatingApp") {
    return <LaunchWindow message="Updating to the Latest Version" />;
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
