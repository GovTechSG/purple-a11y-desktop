import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";

const LaunchWindow = () => {
  const [launchStatus, setLaunchStatus] = useState(null);

  useEffect(() => {
    window.services.launchStatus((s) => {
      setLaunchStatus(s);
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
      main: "Setting Up Purple HATS",
      sub: "This may take a while. Please do not close the application.",
    },
    checkingUpdates: { main: "Checking for Updates" },
    updatingApp: {
      main: "Updating to the Latest Version",
      sub: "This may take a while. Please do not close the application.",
    },
    offline: {
      main: "No internet connection",
      sub: "Waiting for reconnection.",
    },
  };

  if (!launchStatus) {
    return null;
  }

  const { main: displayedMessage, sub: displayedSub } = messages[launchStatus];

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#4E42DA",
        p: 4,
      }}
    >
      <CircularProgress sx={{ color: "white", mb: 4 }} thickness={4} />
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Ubuntu",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "24px",
          lineHeight: "1.5",
          paddingBottom: "6px",
          color: "#FFFFFF",
        }}
      >
        {displayedMessage}
      </Typography>
      {displayedSub && (
        <Typography
          variant="p"
          sx={{
            fontFamily: "Ubuntu",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "14px",
            lineHeight: "1.5",
            paddingBottom: "6px",
            color: "#FFFFFF",
          }}
        >
          {displayedSub}
        </Typography>
      )}
    </Box>
  );
};

export default LaunchWindow;
