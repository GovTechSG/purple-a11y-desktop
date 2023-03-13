import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

const LaunchWindow = ({ message, subMessage }) => {
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
        {message}
      </Typography>
      {subMessage && (
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
          {subMessage}
        </Typography>
      )}
    </Box>
  );
};

export default LaunchWindow;
