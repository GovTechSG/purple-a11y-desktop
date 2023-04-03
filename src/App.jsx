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

  if (status === "launch") {
    return <LaunchWindow />
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
