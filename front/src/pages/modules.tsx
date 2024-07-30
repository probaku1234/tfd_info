import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import {
  Box,
  Image,
  Text,
  SimpleGrid,
  Badge,
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { SEO } from "../components/seo";
import { graphql, PageProps } from "gatsby";
import { Module, ModuleStat } from "../types";
import ModuleComponent from "../components/module";
import "./modules.css";

interface ModulesPageProps extends PageProps {
  data: {
    allModule: {
      nodes: Module[];
    };
  };
}

export const query = graphql`
  {
    allModule {
      nodes {
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
  }
`;

const ModulesPage: React.FC<ModulesPageProps> = ({ data }) => {
  const modules = data.allModule.nodes;

  return (
    <Layout>
      <Box p={5} bg="gray.800" minH="100vh" width={"100%"}>
        <VStack spacing={4} mb={6}>
          {/* <HStack spacing={4}>
            <Input
              placeholder="Search by stats or name"
              bg="gray.700"
              border="none"
              color="white"
            />
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              bg="gray.700"
              color="white"
              _hover={{ bg: "gray.600" }}
            />
          </HStack> */}
          <HStack spacing={4} w="100%" justify="space-between">
            <Input
              placeholder="Search by stats or name"
              bg="gray.700"
              border="none"
              color="white"
            />
            <Select
              defaultValue={'all'}
              bg="gray.700"
              border="none"
              color="white"
            >
              <option>전체</option>
              <option style={{ color: "#2895bb" }}>일반</option>
              <option style={{ color: "#864ab7" }}>희귀</option>
              <option style={{ color: "#bf9138" }}>궁극</option>
              <option style={{ color: "#b1543f" }}>초월</option>
              {/* 추가 옵션들 */}
            </Select>
            <HStack spacing={2}>
              <IconButton
                aria-label="Filter by class"
                icon={
                  <Image 
                    src="/images/module_descendant.png"
                    alt="계승자"
                  />
                }
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                icon={
                  <Image 
                    src="/images/module_ammo_a.png"
                    alt="일반탄"
                  />
                }
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                icon={
                  <Image 
                    src="/images/module_ammo_b.png"
                    alt="충격탄"
                  />
                }
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                icon={
                  <Image 
                    src="/images/module_ammo_c.png"
                    alt="특수탄"
                  />
                }
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                icon={
                  <Image 
                    src="/images/module_ammo_d.png"
                    alt="고위력탄"
                  />
                }
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              />
            </HStack>
            <Select
              defaultValue={"all"}
              bg="gray.700"
              border="none"
              color="white"
            >
              <option value="all">전체</option>
              <option value="크산틱">크산틱</option>
              <option value="세룰리안">세룰리안</option>
              <option value="알만딘">알만딘</option>
              <option value="말라카이트">말라카이트</option>
              <option value="루틸">루틸</option>
            </Select>
          </HStack>
        </VStack>

        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} spacing={5}>
          {modules.map((module) => (
            <ModuleComponent module={module} />
          ))}
        </SimpleGrid>
      </Box>
    </Layout>
  );
};

export default ModulesPage;

export const Head = () => <SEO />;
