import { extendTheme } from "@chakra-ui/react";

// Or export `extendBaseTheme` if you only want the default Chakra theme tokens to extend (no default component themes)
export const customTheme = extendTheme({
  fonts: {
    heading: "'Do Hyeon', sans-serif",
    body: "'Do Hyeon', sans-serif",
  }
});
