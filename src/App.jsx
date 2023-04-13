import React, { useEffect, useState } from "react";
import MainWindow from "./MainWindow";
import LaunchWindow from "./LaunchWindow";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    window.services.guiReady();
  }, []);

  useEffect(() => {
    window.services.appStatus((s) => {
      setStatus(s);
    });
  });

  if (status === "launch") {
    return <LaunchWindow />;
  }

  if (status === "ready") {
    return <MainWindow />;
  }

  return null;
}

export default App;
