import React from "react";
import Layout from "../components/layout";
import { Box, Heading } from "@chakra-ui/react";
import { useSession } from "../context/session_context";

const UserProfilePage = () => {
  const { session } = useSession();

  if (!session) {
    return (
      <Layout>
        <Box>
          <Heading>You need login</Heading>
        </Box>
      </Layout>
    ); // Or you can return a loading spinner
  }

  return (
    <Layout>
      <Box>hello???</Box>
    </Layout>
  );
};

export default UserProfilePage;
