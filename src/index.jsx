import { createRoot } from "react-dom/client";
import { SpSpa, fallbackTheme } from "pankosmia-rcl";
import App from "./App";
import "./index.css";
import { useEffect, useState } from "react";
import { getAndSetJson } from "pithekos-lib";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
function AppLayout() {
  const [themeSpec, setThemeSpec] = useState(fallbackTheme);
  const theme = createTheme(themeSpec);
  useEffect(() => {
    if (
      themeSpec.palette &&
      themeSpec.palette.primary &&
      themeSpec.palette.primary.main &&
      themeSpec.palette.primary.main === "#666"
    ) {
      getAndSetJson({
        url: "/app-resources/themes/default.json",
        setter: setThemeSpec,
      }).then();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SpSpa
        requireNet={false}
        titleKey="pages:core-dashboard:title"
        currentId="core-dashboard"
      >
        <App />
      </SpSpa>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(<AppLayout />);
