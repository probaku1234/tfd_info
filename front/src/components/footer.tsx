import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box as="footer" bg="blue.700" color="white" py={4} px={8} textAlign="center">
      <Text>&copy; {new Date().getFullYear()} My Gatsby Site. All rights reserved.</Text>
    </Box>
  );
};

export default Footer;
