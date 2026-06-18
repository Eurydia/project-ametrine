import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ToastContainer } from "react-toastify";
import { theme } from "../theme";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
        <ToastContainer />
      </ThemeProvider>
      <TanStackRouterDevtools />
    </>
  );
}
