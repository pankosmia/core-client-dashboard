import { createRoot } from "react-dom/client";
import { SpSpa } from "pankosmia-rcl";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@emotion/react";
import { MaterialDesignContent, SnackbarProvider } from "notistack";
import styled from "@emotion/styled";

function AppLayout() {
  const CustomSnackbarContent = styled(MaterialDesignContent)(() => ({
    "&.notistack-MuiContent-error": {
      backgroundColor: "#FDEDED",
      color: "#D32F2F",
    },
    "&.notistack-MuiContent-info": {
      backgroundColor: "#E5F6FD",
      color: "#0288D1",
    },
    "&.notistack-MuiContent-warning": {
      backgroundColor: "#FFF4E5",
      color: "#EF6C00",
    },
    "&.notistack-MuiContent-success": {
      backgroundColor: "#EDF7ED",
      color: "#2E7D32",
    },
  }));
  return (
    <SnackbarProvider
      Components={{
        error: CustomSnackbarContent,
        info: CustomSnackbarContent,
        warning: CustomSnackbarContent,
        success: CustomSnackbarContent,
      }}
      maxSnack={6}
    >
      <SpSpa
        requireNet={false}
        titleKey="pages:core-dashboard:title"
        currentId="core-dashboard"
      >
        <App />
      </SpSpa>
    </SnackbarProvider>
  );
}

createRoot(document.getElementById("root")).render(<AppLayout />);
