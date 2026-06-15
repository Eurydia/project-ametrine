import { ThemeProvider } from "@mui/material/styles";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { theme } from "../theme";
import CssBaseline from "@mui/material/CssBaseline";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
      </ThemeProvider>
      <TanStackRouterDevtools />
    </>
  );
}
