import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

let theme = createTheme();
theme = responsiveFontSizes(theme);

export { theme };
