import React, { useContext, useState, useRef, useEffect } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  Divider,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as GatsbyLink, navigate } from "gatsby";
import LocaleContext from "../context/locale_context";
import { supabase, signOut } from "../utils/supabaseClient";
import "./header.module.css";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSession } from "../context/session_context";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  const localeContext = useContext(LocaleContext);
  const { locale, setLocale } = localeContext!;
  const { session } = useSession();
  const toast = useToast();
  const translations = translation[locale] || translation.en;

  if (!localeContext) {
    throw new Error("Header must be used within a LocaleProvider");
  }

  const toggleLocale = () => {
    setLocale(locale === "ko" ? "en" : "ko");
  };

  useEffect(() => {
    if (session) {
      onCloseModal();
    }
  }, [session]);

  useEffect(() => {
    // Subscribe to authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Toast
      if (event == "SIGNED_OUT") {
        toast({
          title: "Signed out successfully.",
          description: "You have been signed out.",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }
      console.log(event);
    });

    // 3. Cleanup: Unsubscribe from the auth state changes when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

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
        <Menu>
          <MenuButton
            display={{ base: "none", md: session ? "block" : "none" }}
          >
            <Avatar name={session?.user.email} src={""} size={"sm"} />
          </MenuButton>
          <MenuList color={"black"}>
            <MenuItem onClick={() => navigate("/user_profile")}>
              {translations.profile}
            </MenuItem>
            <MenuItem onClick={signOut}>{translations.sign_out}</MenuItem>
          </MenuList>
        </Menu>
        <Button
          onClick={onOpenModal}
          display={{ base: "none", md: session ? "none" : "block" }}
        >
          {translations.sign_in}
        </Button>
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
            color={"white"}
          />
        </Flex>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={"full"}>
        <DrawerOverlay>
          <DrawerContent bg="gray.800">
            <DrawerCloseButton color={"white"} />
            <DrawerHeader>
              <Box as="button" onClick={toggleLocale} textColor={"white"}>
                {locale === "ko" ? "한국어" : "EN"}
              </Box>
            </DrawerHeader>
            <DrawerBody>
              <Flex direction="column" align="start" textColor={"white"}>
                <Link as={GatsbyLink} to="/user_info" my={2} onClick={onClose}>
                  {locale === "ko" ? "유저 정보 조회" : "Search User Info"}
                </Link>
                <Link
                  as={GatsbyLink}
                  to="/reward_rotation"
                  my={2}
                  onClick={onClose}
                >
                  {locale === "ko"
                    ? "난이도 보상 로테이션"
                    : "Difficulty Level Rewards"}
                </Link>
                <Link as={GatsbyLink} to="/modules" my={2} onClick={onClose}>
                  {locale === "ko" ? "모듈" : "Module"}
                </Link>
                <Divider />
                {session ? (
                  <>
                    <Text>{session.user.email}</Text>
                    <Link
                      as={GatsbyLink}
                      to="/user_profile"
                      my={2}
                      onClick={onClose}
                    >
                      {translations.profile}
                    </Link>
                    <Link as={GatsbyLink} to={window.location.pathname} my={2} onClick={() => {
                      onClose()
                      signOut()
                    }}>
                      {translations.sign_out}
                    </Link>
                  </>
                ) : (
                  <Button onClick={onOpenModal}>{translations.sign_in}</Button>
                )}
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>

      <Modal isOpen={isOpenModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          {/* <ModalHeader>Modal Title</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody m={4}>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: {
                    background: "gray",
                    color: "black",
                    borderColor: "gray",
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: translations.email_label,
                    password_label: translations.password_label,
                    email_input_placeholder:
                      translations.email_input_placeholder,
                    password_input_placeholder:
                      translations.password_input_placeholder,
                    button_label: translations.button_label_sign_in,
                    loading_button_label:
                      translations.loading_button_label_sign_in,
                    link_text: translations.link_text_sign_in,
                  },
                  sign_up: {
                    email_label: translations.email_label,
                    password_label: translations.password_label,
                    email_input_placeholder:
                      translations.email_input_placeholder,
                    password_input_placeholder:
                      translations.password_input_placeholder,
                    button_label: translations.button_label_sign_up,
                    loading_button_label:
                      translations.loading_button_label_sign_up,
                    link_text: translations.link_text_sign_up,
                    confirmation_text: translations.confirmation_text,
                  },
                  forgotten_password: {
                    email_label: translations.email_label,
                    password_label: translations.password_label,
                    email_input_placeholder:
                      translations.email_input_placeholder,
                    button_label: translations.button_label_forgot_pass,
                    loading_button_label:
                      translations.loading_button_label_forgot_pass,
                    link_text: translations.link_text_forgot_pass,
                  },
                },
              }}
              dark
              providers={[]}
              redirectTo={window.location.pathname}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;

const translation: {
  [key: string]: {
    sign_in: string;
    sign_out: string;
    sign_up: string;
    email_label: string;
    password_label: string;
    email_input_placeholder: string;
    password_input_placeholder: string;
    button_label_sign_in: string;
    loading_button_label_sign_in: string;
    link_text_sign_in: string;
    button_label_sign_up: string;
    loading_button_label_sign_up: string;
    link_text_sign_up: string;
    confirmation_text: string;
    link_text_forgot_pass: string;
    button_label_forgot_pass: string;
    loading_button_label_forgot_pass: string;
    profile: string;
  };
} = {
  ko: {
    sign_in: "로그인",
    sign_out: "로그아웃",
    sign_up: "회원가입",
    email_label: "이메일 주소",
    password_label: "비밀번호",
    email_input_placeholder: "이메일 주소",
    password_input_placeholder: "비밀번호",
    button_label_sign_in: "로그인",
    loading_button_label_sign_in: "로그인 중 ...",
    link_text_sign_in: "이미 계정이 있으신가요? 로그인",
    button_label_sign_up: "회원가입",
    loading_button_label_sign_up: "가입 중 ...",
    link_text_sign_up: "계정이 없으신가요? 회원가입",
    confirmation_text: "확인 링크가 이메일로 전송되었습니다.",
    link_text_forgot_pass: "비밀번호를 잊어버렸습니까?",
    button_label_forgot_pass: "암호 재설정 지침 전송",
    loading_button_label_forgot_pass: "재설정 지침을 보내는 중 ...",
    profile: "프로필",
  },
  en: {
    sign_in: "Sign In",
    sign_out: "Sign Out",
    sign_up: "Sign Up",
    email_label: "Email address",
    password_label: "Create a Password",
    email_input_placeholder: "Your email address",
    password_input_placeholder: "Your password",
    button_label_sign_in: "Sign In",
    loading_button_label_sign_in: "Signing in ...",
    link_text_sign_in: "Already have an account? Sign in",
    button_label_sign_up: "Sign up",
    loading_button_label_sign_up: "Signing up ...",
    link_text_sign_up: "Don't have an account? Sign up",
    confirmation_text: "Check your email for the confirmation link",
    link_text_forgot_pass: "Forgot your password?",
    button_label_forgot_pass: "Send reset password instructions",
    loading_button_label_forgot_pass: "Sending reset instructions ...",
    profile: "Profile",
  },
};
