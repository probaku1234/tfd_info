import * as React from "react";
import { Link, HeadFC, PageProps } from "gatsby";
import {
  Box,
  Code,
  Heading,
  Link as ChakraLink,
  Text,
  Button,
} from "@chakra-ui/react";
import Layout from "../components/layout";
import LocaleContext from "../context/locale_context";

const NotFoundPage: React.FC<PageProps> = () => {
  const localeContext = React.useContext(LocaleContext);
  const { locale } = localeContext!;

  const getTranslation = (locale: string) => {
    return translation[locale] || translation.en;
  };

  const { page_not_found, message } = getTranslation(locale);

  return (
    <Layout>
      <Box textAlign={"center"} position={"relative"} textColor={"white"}>
        <Heading as="h1" fontSize={"20em"}>
          404
        </Heading>
        <Heading as="h1" mt={0} mb={16} maxW="container.sm" fontSize={"4em"}>
          {page_not_found}
        </Heading>
        <Text mb={12} fontSize={"2xl"}>
          {message}
          <br />
          {process.env.NODE_ENV === "development" ? (
            <>
              <br />
              Try creating a page in{" "}
              <Code
                colorScheme="yellow"
                p={1}
                fontSize="lg"
                borderRadius="base"
              >
                src/pages/
              </Code>
              .
              <br />
            </>
          ) : null}
        </Text>
      </Box>
    </Layout>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Not found</title>;

const translation: {
  [key: string]: { page_not_found: string; message: string };
} = {
  ko: {
    page_not_found: "페이지를 찾을 수 없습니다.",
    message: "죄송합니다 😔, 원하시는 페이지를 찾을 수 없습니다.",
  },
  en: {
    page_not_found: "Page not found",
    message: "Sorry 😔, we couldn’t find what you were looking for.",
  },
};
