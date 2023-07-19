import LoadingSpinner from "../common/components/LoadingSpinner";
import Button from "../common/components/Button";
import { useEffect, useState } from "react";
import "./LaunchWindow.scss";

const LaunchWindow = () => {
  const [launchStatus, setLaunchStatus] = useState(null);
  const [promptUpdate, setPromptUpdate] = useState(false);

  useEffect(() => {
    window.services.launchStatus((s) => {
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
    if (launchStatus === "frontendDownloadComplete") {
      setPromptUpdate(false);
    }

  }, [launchStatus]);

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
      main: "Downloading",
      sub: "This may take a few minutes. Please do not close the application.",
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

  const handlePromptLaunchInstallerResponse = (response) => () => {
    window.services.launchInstaller(response);
    // setPromptUpdate(false);
  };

  const handlePromptRestartAppResponse = (response) => () => {
    window.services.restartAppAfterMacOSFrontendUpdate(response);
    // setPromptUpdate(false);
  };

  if (promptUpdate) {
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

  if (launchStatus === "frontendDownloadComplete") {
    return (
      <div id="launch-window">
        <div>
          <h1>New installer has been downloaded</h1>
          <p>Would you like to run the installer now?</p>
          <Button
            type="secondary"
            onClick={handlePromptLaunchInstallerResponse(false)}
          >
            Later
          </Button>
          <Button
            id="proceed-button"
            type="primary"
            onClick={handlePromptLaunchInstallerResponse(true)}
          >
            Run
          </Button>
        </div>
      </div>
    );
  }

  if (launchStatus === "frontendDownloadCompleteMacOS") {
    return (
      <div id="launch-window">
        <div>
          <h1>New App has been downloaded</h1>
          <p>Would you like to restart the application?</p>
          <Button
            type="secondary"
            onClick={handlePromptRestartAppResponse(false)}
          >
            Later
          </Button>
          <Button
            id="proceed-button"
            type="primary"
            onClick={handlePromptRestartAppResponse(true)}
          >
            Run
          </Button>
        </div>
      </div>
    );
  }

  const { main: displayedMessage, sub: displayedSub } = messages[launchStatus];
  return (
    <div id="launch-window">
      <LoadingSpinner />
      <h1>{displayedMessage}</h1>
      {displayedSub && <p>{displayedSub}</p>}
    </div>
  );
};

export default LaunchWindow;
