import React from "react";
import { Box, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="blue.700"
      color="white"
      py={4}
      px={8}
      textAlign="center"
    >
      <Text>
        This site is in no way associated with
        or endorsed by NEXON Games Co, LTD.
      </Text>
    </Box>
  );
};

export default Footer;
