import React, { ReactNode } from 'react';
import { Flex } from '@chakra-ui/react';
import Header from './header'
import Footer from './footer';
import { Analytics } from "@vercel/analytics/react"

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex direction="column" minH="100vh" backgroundImage={'url("/images/background.png")'}>
      <Header />
      <Flex as="main" direction="column" align="center" justify="center" flex="1" p={4}>
        {children}
        <Analytics />
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Layout;
