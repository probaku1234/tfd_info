import React, { useState } from "react";
import Layout from "../components/layout";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "../context/session_context";
import { supabase } from "../utils/supabaseClient";
import { AuthError } from "@supabase/supabase-js";

const UserProfilePage = () => {
  const { session } = useSession();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const updateProfile = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nickname })
        .eq("id", session?.user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated.",
        description: "Your nickname has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating profile.",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset.",
        description: "Your password has been reset successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error resetting password.",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Layout>
        <Box p={6}>
          <Heading>You need to login</Heading>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={6}>
        <Heading mb={6}>User Profile</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl id="nickname">
            <FormLabel>Nickname</FormLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={updateProfile}
            isLoading={loading}
            isDisabled={!nickname}
          >
            Update Nickname
          </Button>

          <FormControl id="password">
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </FormControl>
          <Button
            colorScheme="red"
            onClick={resetPassword}
            isLoading={loading}
            isDisabled={!password}
          >
            Reset Password
          </Button>
        </VStack>
      </Box>
    </Layout>
  );
};

export default UserProfilePage;
