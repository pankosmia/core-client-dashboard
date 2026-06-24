import { createRoot } from "react-dom/client";
import { SpSpa, fallbackTheme } from "pankosmia-rcl";
import App from "./App";
import "./index.css";
import { useEffect, useState } from "react";
import { getAndSetJson } from "pankosmia-lib/http";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
function AppLayout() {
  const [themeSpec, setThemeSpec] = useState(fallbackTheme);

  useEffect(() => {
    if (
      themeSpec.palette &&
      themeSpec.palette.primary &&
      themeSpec.palette.primary.main &&
      themeSpec.palette.primary.main === "#666"
    ) {
      getAndSetJson({
        url: "/api/app-resources/themes/default.json",
        setter: setThemeSpec,
      }).then();
    }
  }, []);
  const theme = createTheme(
    {
      components: {
        MuiFab: {
          styleOverrides: {
            root: {
              textTransform: "capitalize",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "capitalize",
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: "capitalize",
            },
          },
        },
      },
    },
    themeSpec,
  );
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
