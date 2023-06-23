import LoadingSpinner from "../common/components/LoadingSpinner";
import Button from "../common/components/Button";
import { useEffect, useState } from "react";
import "./LaunchWindow.scss";

const LaunchWindow = () => {
  const [launchStatus, setLaunchStatus] = useState(null);
  const [promptUpdate, setPromptUpdate] = useState(false);

  useEffect(() => {
    window.services.launchStatus((s) => {
      console.log(s);
      if (s === "promptFrontendUpdate" || s === "promptBackendUpdate") {
        setPromptUpdate(true);
      } else {
        setLaunchStatus(s);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("offline", () => {
      const lastKnownStatus = launchStatus;
      setLaunchStatus("offline");

      window.addEventListener(
        "online",
        () => {
          setLaunchStatus(lastKnownStatus);
        },
        { once: true }
      );
    });
  }, [launchStatus]);

  useEffect(() => {
    console.log(promptUpdate);
    console.log(launchStatus);
  }, [promptUpdate, launchStatus]);

  const messages = {
    settingUp: {
      main: "Setting up",
      sub: "This may take a few minutes. Please do not close the application.",
    },
    checkingUpdates: { main: "Checking for Updates" },
    updatingBackend: {
      main: "Updating application",
      sub: "This may take a few minutes. Please do not close the application.",
    },
    updatingFrontend: {
      main: "Downloading new installer",
      sub: "This may take a few minutes. The application will close after and you will be guided through the reinstallation.",
    },
    offline: {
      main: "No internet connection",
      sub: "Waiting for reconnection.",
    },
  };

  if (!launchStatus) {
    return null;
  }

  const handlePromptUpdateResponse = (response) => () => {
    window.services.proceedUpdate(response);
    setPromptUpdate(false);
  };

  const { main: displayedMessage, sub: displayedSub } = messages[launchStatus];

  if (promptUpdate) {
    console.log("going to return prompt update");
    return (
      <div id="launch-window">
        <div>
          <h1>New update available</h1>
          <p>Would you like to update now? It may take a few minutes.</p>
          <Button type="secondary" onClick={handlePromptUpdateResponse(false)}>
            Later
          </Button>
          <Button
            id="proceed-button"
            type="primary"
            onClick={handlePromptUpdateResponse(true)}
          >
            Update
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div id="launch-window">
      <LoadingSpinner />
      <h1>{displayedMessage}</h1>
      {displayedSub && <p>{displayedSub}</p>}
    </div>
  );
};

export default LaunchWindow;
