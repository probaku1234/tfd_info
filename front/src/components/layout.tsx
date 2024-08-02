import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import Header from "./header";
import Footer from "./footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./layout.css";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      backgroundImage={'url("/images/background.png")'}
    >
      <Header />
      <Flex
        as="main"
        direction="column"
        align="center"
        justify="center"
        flex="1"
        p={4}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Layout;
