import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function Loading() {
  return (
    <Box sx={{ display: "grid", marginTop: "17vh" }}>
      <CircularProgress sx={{ width: "100%", margin: "auto" }} />
      <div variant="h6" className="scanProgress">
        Please wait while we scan your site...
      </div>
    </Box>
  );
}
