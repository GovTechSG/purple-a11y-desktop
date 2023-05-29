import LoadingSpinner from "../common/components/LoadingSpinner";
import Button from "../common/components/Button";
import { useEffect, useState } from "react";
import "./LaunchWindow.scss";

const LaunchWindow = () => {
  const [launchStatus, setLaunchStatus] = useState(null);
  const [promptUpdate, setPromptUpdate] = useState(false);
  const [userData, setUserData] = useState(false); 
  const [userName, setUserName] = useState(null); 
  const [userEmail, setUserEmail] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    window.services.launchStatus((s) => {
      if (s === "promptUpdate") {
        setPromptUpdate(true);
      } else if (s === "setUserData") {
        setUserData(true); 
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

  const messages = {
    settingUp: {
      main: "Setting up",
      sub: "This may take a few minutes. Please do not close the application.",
    },
    checkingUpdates: { main: "Checking for Updates" },
    updatingApp: {
      main: "Updating app",
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

  const handleSetUserData = () => () => {
    // const invalidName = (userName === null || userName.trim() === ''); 
    // const invalidEmail = (userEmail === null || userEmail.trim() === '' || !isValidEmail(userEmail));

    // if (invalidEmail || invalidName) {
    //   setErrorMessage("Invalid name or email.");
    //   return;
    // } else {
      window.services.setUserData({name: userName, email: userEmail, autoSubmit: true});
      setUserData(false);
    // }
  }

  // const isValidEmail = (email) => {
  //   let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
  //   return regex.test(email);
  // }

  const { main: displayedMessage, sub: displayedSub } = messages[launchStatus];

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
  if (userData) {
    return (
      <div id="launch-window">
        <div>
          <h1>Please enter your user details</h1>
          {errorMessage && (<p className="error-text">{errorMessage}</p>)}
          <form>
            <label for="name">Name</label>
            <input type="text" id="name" onChange={(e) => setUserName(e.target.value)}></input><br/>
            <label for="email">Email</label>
            <input type="text" id="email" onChange={(e) => setUserEmail(e.target.value)}></input>
            <Button
              id="submit-button"
              type="submit"
              onClick={handleSetUserData()}
            >
              Submit
            </Button>
          </form>
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
