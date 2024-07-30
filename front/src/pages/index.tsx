import React, { useState } from "react";
// import { navigate } from 'gatsby';
import { navigate } from "@reach/router";
import Layout from "../components/layout";
import { Box, Heading, Text, Input, Button, Flex } from "@chakra-ui/react";
import { SEO } from "../components/seo";

const IndexPage = () => {
  const [userId, setUserId] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (userId.trim()) {
      const encodedUserId = encodeURIComponent(userId.trim());
      navigate(`/user_info?id=${encodedUserId}`);
    }
  };

  return (
    <Layout>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to My Gatsby Site
        </Heading>
        <Text fontSize="xl" mb={4}>
          This is the homepage.
        </Text>
        {/* <Box as="form" onSubmit={handleSearch}>
          <Flex justify="center">
            <Input
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              width="300px"
              mr={2}
            />
            <Button type="submit" colorScheme="teal">
              Search
            </Button>
          </Flex>
        </Box> */}
      </Box>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <SEO />;
