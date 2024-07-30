import React, { useEffect, useState } from "react";
import { useLocation } from "@reach/router";
import Layout from "../components/layout";
import { Box, Heading, Text, Spinner } from "@chakra-ui/react";
import axios from "axios";

const UserInfoPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const query = new URLSearchParams(location.search);
  const userId = query.get("id");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("qwe");
        // Replace with your actual API call
        const response = await axios.get(
          `/tfd/v1/id`,
          {
            headers: {
              "x-nxopen-api-key": `${process.env.NEXON_API_KEY}`,
            },
            baseURL: `${process.env.NEXON_API_BASE_URL}`,
            params: { user_name: userId },
          }
        );
        const userOuid = response.data.ouid;
        console.log(userOuid);
        const descendantResponse = await axios.get(
          'tfd/v1/user/descendant',
          {
            headers: {
              "x-nxopen-api-key": `${process.env.NEXON_API_KEY}`,
            },
            baseURL: `${process.env.NEXON_API_BASE_URL}`,
            params: {ouid: userOuid}
          }
        );
        console.log(descendantResponse);
        setUserData(descendantResponse.data);
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserId();
    }
  }, [userId]);

  return (
    <Layout>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>
          Search Results
        </Heading>
        {loading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text fontSize="xl" color="red.500">
            {error}
          </Text>
        ) : userData ? (
          <Box>
            <Text fontSize="xl">User ID: {userData.id}</Text>
            <Text fontSize="xl">User Name: {userData.name}</Text>
            {/* Add more user data as needed */}
          </Box>
        ) : (
          <Text fontSize="xl">No user data found</Text>
        )}
      </Box>
    </Layout>
  );
};

export default UserInfoPage;
