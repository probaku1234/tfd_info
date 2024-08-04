import React, { useContext } from "react";
import Layout from "../components/layout";
import { Box, Heading, Text, Image, keyframes } from "@chakra-ui/react";
import { SEO } from "../components/seo";
import LocaleContext from "../context/locale_context";

const IndexPage = () => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;

  // Define keyframes for the animations
  const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `;

  const blurOut = keyframes`
    from { filter: blur(0px); }
    to { filter: blur(8px); }
  `;

  const getTranslation = (locale: string) => {
    return translation[locale] || translation.en;
  };

  const { welcome_title, welcome_message } = getTranslation(locale);

  return (
    <Layout>
      <Box textAlign="center" position="relative">
        <Box position="relative" display="inline-block">
          <Image
            src={"/images/main2.png"}
            alt="Background Image"
            animation={`${blurOut} 2s ease forwards`}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="white"
            textAlign="center"
            opacity="0"
            animation={`${fadeIn} 2s ease forwards 1s`} // Delay text fade-in to start after image blur begins
          >
            <Heading as="h1" size="4xl" mb={4}>
              {welcome_title}
            </Heading>
            <Text fontSize="2xl" mb={4}>
              {welcome_message}
            </Text>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <SEO />;

const translation: { [key: string]: { welcome_title: string; welcome_message: string } } = {
  ko: {
    welcome_title: "환영합니다, 계승자님",
    welcome_message:
      "퍼스트 디센턴트 유저 계승자, 보상 로테이션, 모듈 정보를 확인해보세요.",
  },
  en: {
    welcome_title: "Welcome, Descendant",
    welcome_message:
      "Check out the First Decent User, Reward Rotation, and Module information.",
  },
};
