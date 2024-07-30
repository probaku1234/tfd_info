import React, { useState } from "react";
import { graphql, PageProps } from "gatsby";
import Layout from "../components/layout";
import { Box, Image, Text, Badge, VStack, HStack } from "@chakra-ui/react";
import { SEO } from "../components/seo";
import { Module } from "../types";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import ModuleComponent from "../components/module";

interface ModuleDetailProps extends PageProps {
  data: {
    module: Module;
  };
}

export const query = graphql`
  query ($module_id: String!) {
    module(module_id: { eq: $module_id }) {
      module_id
      module_name
      image_url
      module_type
      module_tier
      module_stat {
        level
        module_capacity
        value
      }
      module_class
      module_socket_type
    }
  }
`;

const ModuleDetail: React.FC<ModuleDetailProps> = ({ data }) => {
  const module = data.module;

  const [level, setLevel] = useState(0);

  const handleArrowClick = (isLeft: boolean) => {
    if (isLeft) {
      if (level > 0) {
        setLevel(level - 1);
      }
    } else {
      if (level < module.module_stat.length - 1) {
        setLevel(level + 1);
      }
    }
  };

  return (
    <Layout>
      <Box p={5} bg="gray.800" minH="100vh" width={"100%"}>
        <VStack spacing={4}>
          <HStack justifyContent="center" alignItems="center">
            <ArrowLeftIcon
              width={"10%"}
              height={"10%"}
              color={"white"}
              cursor={"pointer"}
              onClick={() => handleArrowClick(true)}
              mr={10}
            />
            <ModuleComponent module={module} level={level}/>
            <ArrowRightIcon
              width={"10%"}
              height={"10%"}
              color={"white"}
              cursor={"pointer"}
              onClick={() => handleArrowClick(false)}
              ml={10}
            />
          </HStack>

          {module.module_stat.map((stat, index) => (
            <Box
              key={index}
              p={2}
              bg="gray.700"
              borderRadius="md"
              width="100%"
              textAlign="center"
              border={'1px solid'}
              borderColor={index === level ? 'red': ''}
            >
              <Text color="white">강화 레벨: {stat.level}</Text>
              <Text color="white">수용량: {stat.module_capacity}</Text>
              <Text color="white">{stat.value}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Layout>
  );
};

export default ModuleDetail;

export const Head = () => (
  <SEO
    title="모듈 상세 정보"
    description="모듈의 상세 정보를 확인할 수 있습니다."
  />
);
