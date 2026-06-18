import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

let theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F7F2EA",
      paper: "#FFF8EF",
    },
    primary: {
      main: "#795548", // MUI brown[500]
      light: "#A98274",
      dark: "#4B2C20",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8D6E63", // brown[400]
      light: "#BE9C91",
      dark: "#5F4339",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#2E211B",
      secondary: "#5D4A42",
      disabled: "#9C8C84",
    },
    divider: "#D7C8BA",
    action: {
      hover: "rgba(121, 85, 72, 0.08)",
      selected: "rgba(121, 85, 72, 0.14)",
      disabled: "rgba(46, 33, 27, 0.26)",
      disabledBackground: "rgba(46, 33, 27, 0.12)",
    },
  },
});
theme = responsiveFontSizes(theme);

export { theme };
