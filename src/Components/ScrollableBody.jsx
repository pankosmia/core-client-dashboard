import { useContext } from "react";
import { productContext } from "pankosmia-rcl";
import { Box } from "@mui/material";

export default function ScrollableBody({ children }) {
  let { productRef } = useContext(productContext);
  let isAndroid =
    productRef && productRef.current && productRef.current.os === "android";
  return (
    <Box
      sx={{
        mb: 2,
        position: "fixed",
        top: isAndroid ? "94px" : "64px",
        left: isAndroid ? "30px" : 0,
        bottom: isAndroid ? "30px" : 0,
        right: isAndroid ? "30px" : 0,
        overflow: "auto",
        width: isAndroid ? "calc(100% - 60px)" : "100%",
      }}
    >
      {children}
    </Box>
  );
}
