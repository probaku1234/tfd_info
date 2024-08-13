import React, { useContext, useState } from "react";
import {
  Box,
  Flex,
  Link,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as GatsbyLink } from "gatsby";
import LocaleContext from "../context/locale_context";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        <Flex display={{ base: "none", md: "flex" }} flex="1" justify="center">
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
        <Flex align="center">
          <Box
            as="button"
            onClick={toggleLocale}
            _hover={{
              bg: locale === "ko" ? "blue.500" : "gray.500",
              color: "white",
            }}
            minWidth="70px"
            display={{ base: "none", md: "block" }}
            mr={4}
          >
            {locale === "ko" ? "한국어" : "EN"}
          </Box>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            display={{ base: "block", md: "none" }}
            onClick={onOpen}
            bg="transparent"
            _hover={{ bg: "gray.700" }}
            _focus={{ boxShadow: "none" }}
            color={'white'}
          />
        </Flex>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={'full'}>
        <DrawerOverlay>
          <DrawerContent bg="gray.800">
            <DrawerCloseButton color={'white'}/>
            <DrawerHeader>
              <Box as="button" onClick={toggleLocale} textColor={'white'}>
                {locale === "ko" ? "한국어" : "EN"}
              </Box>
            </DrawerHeader>
            <DrawerBody>
              <Flex direction="column" align="start" textColor={'white'}>
                <Link as={GatsbyLink} to="/user_info" my={2} onClick={onClose}>
                  {locale === "ko" ? "유저 정보 조회" : "Search User Info"}
                </Link>
                <Link as={GatsbyLink} to="/reward_rotation" my={2} onClick={onClose}>
                  {locale === "ko"
                    ? "난이도 보상 로테이션"
                    : "Difficulty Level Rewards"}
                </Link>
                <Link as={GatsbyLink} to="/modules" my={2} onClick={onClose}>
                  {locale === "ko" ? "모듈" : "Module"}
                </Link>
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Box>
  );
};

export default Header;
