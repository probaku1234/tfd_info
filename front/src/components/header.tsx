import React, { useContext } from "react";
import { Box, Flex, Link, Button } from "@chakra-ui/react";
import { Link as GatsbyLink } from "gatsby";
import LocaleContext from "../context/locale_context";

const Header = () => {
  const localeContext = useContext(LocaleContext);

  if (!localeContext) {
    throw new Error("Header must be used within a LocaleProvider");
  }

  const { locale, setLocale } = localeContext;

  const toggleLocale = () => {
    setLocale(locale === "ko" ? "en" : "ko");
  };

  return (
    <Box as="header" color="white" py={4} px={8}>
      <Flex as="nav" justify="space-between" align="center">
        <Box>
          <Link as={GatsbyLink} to="/" fontWeight="bold" fontSize="xl">
            TFD INFO
          </Link>
        </Box>
        <Flex flex="1" justify="center">
          <Link as={GatsbyLink} to="/user_info" mx={2}>
            {locale === "ko" ? "유저 정보 조회" : "Search User Info"}
          </Link>
          <Link as={GatsbyLink} to="/reward_rotation" mx={2}>
            {locale === "ko"
              ? "난이도 보상 로테이션"
              : "Difficulty Level Rewards"}
          </Link>
          <Link as={GatsbyLink} to="/modules" mx={2}>
            {locale === "ko" ? "모듈" : "Module"}
          </Link>
        </Flex>
        <Box>
          <Box
            as="button"
            onClick={toggleLocale}
            _hover={{
              bg: locale === "ko" ? "blue.500" : "gray.500",
              color: "white",
            }}
            minWidth="70px"
          >
            {locale === "ko" ? "한국어" : "EN"}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;
