import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout";
import {
  Box,
  Image,
  SimpleGrid,
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { SEO } from "../components/seo";
import { graphql, PageProps, navigate } from "gatsby";
import { Module } from "../types";
import ModuleComponent from "../components/module";
import { useLocation } from "@reach/router";
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedBorderColor = "red";
  const borderColor = "black";

  const [searchKeyword, setSearchKeyword] = useState<string | null>(
    searchParams.get("searchKeyword") || null
  );
  const [tier, setTier] = useState<string>(searchParams.get("tier") || "all");
  const [moduleClass, setModuleClass] = useState<string | null>(
    searchParams.get("moduleClass") || null
  );
  const [socket, setSocket] = useState<string>(
    searchParams.get("socket") || "all"
  );
  const [filteredModules, setFilteredModules] = useState(modules);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    if (tier) params.set("tier", tier);
    if (moduleClass) params.set("moduleClass", moduleClass);
    if (socket) params.set("socket", socket);

    const queryString = params.toString();
    navigate(`?${queryString}`, { replace: true });
  }, [searchKeyword, tier, moduleClass, socket]);

  useEffect(() => {
    const filterModules = () => {
      let filtered = modules;

      if (searchKeyword) {
        filtered = filtered.filter(
          (module) =>
            module.module_name
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()) ||
            module.module_stat.some((stat) =>
              stat.value.toString().includes(searchKeyword)
            )
        );
      }

      if (tier && tier !== "all") {
        filtered = filtered.filter((module) => module.module_tier === tier);
      }

      if (moduleClass) {
        filtered = filtered.filter(
          (module) => module.module_class === moduleClass
        );
      }

      if (socket && socket !== "all") {
        filtered = filtered.filter(
          (module) => module.module_socket_type === socket
        );
      }

      setFilteredModules(filtered);
    };

    filterModules();
  }, [searchKeyword, tier, moduleClass, socket, modules]);

  const onHandleClassIconClick = (value: string) => {
    if (value == moduleClass) {
      setModuleClass(null);
    } else {
      setModuleClass(value);
    }
  };

  const debouncedSetSearchKeyword = useCallback(
    debounce((value) => {
      setSearchKeyword(value);
    }, 300), // 300ms delay
    []
  );

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    debouncedSetSearchKeyword(event.target.value);
  };

  return (
    <Layout>
      <Box p={5} bg="gray.800" minH="100vh" width={"100%"}>
        <VStack spacing={4} mb={6}>
          <HStack spacing={4} w="100%" justify="space-between">
            <Input
              placeholder="Search by stats or name"
              defaultValue={searchKeyword || ""}
              bg="gray.700"
              border="none"
              color="white"
              onChange={handleSearchInputChange}
            />
            <Select
              defaultValue={tier}
              onChange={(e) => setTier(e.target.value)}
              bg="gray.700"
              border="none"
              color="white"
            >
              <option value={"all"}>전체</option>
              <option style={{ color: "#2895bb" }} value={"일반"}>
                일반
              </option>
              <option style={{ color: "#864ab7" }} value={"희귀"}>
                희귀
              </option>
              <option style={{ color: "#bf9138" }} value={"궁극"}>
                궁극
              </option>
              <option style={{ color: "#b1543f" }} value={"초월"}>
                초월
              </option>
              {/* 추가 옵션들 */}
            </Select>
            <HStack spacing={2}>
              <IconButton
                aria-label="Filter by class"
                onClick={() => onHandleClassIconClick("계승자")}
                icon={
                  <Image src="/images/module_descendant.png" alt="계승자" />
                }
                bg="gray.700"
                border={"1px solid"}
                borderColor={
                  moduleClass === "계승자" ? selectedBorderColor : borderColor
                }
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                onClick={() => onHandleClassIconClick("일반탄")}
                icon={<Image src="/images/module_ammo_a.png" alt="일반탄" />}
                bg="gray.700"
                border={"1px solid"}
                borderColor={
                  moduleClass === "일반탄" ? selectedBorderColor : borderColor
                }
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                onClick={() => onHandleClassIconClick("충격탄")}
                icon={<Image src="/images/module_ammo_b.png" alt="충격탄" />}
                bg="gray.700"
                border={"1px solid"}
                borderColor={
                  moduleClass === "충격탄" ? selectedBorderColor : borderColor
                }
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                onClick={() => onHandleClassIconClick("특수탄")}
                icon={<Image src="/images/module_ammo_c.png" alt="특수탄" />}
                bg="gray.700"
                border={"1px solid"}
                borderColor={
                  moduleClass === "특수탄" ? selectedBorderColor : borderColor
                }
                _hover={{ bg: "gray.600" }}
              />
              <IconButton
                aria-label="Filter by class"
                onClick={() => onHandleClassIconClick("고위력탄")}
                icon={<Image src="/images/module_ammo_d.png" alt="고위력탄" />}
                bg="gray.700"
                border={"1px solid"}
                borderColor={
                  moduleClass === "고위력탄" ? selectedBorderColor : borderColor
                }
                _hover={{ bg: "gray.600" }}
              />
            </HStack>
            <Select
              defaultValue={socket}
              onChange={(e) => setSocket(e.target.value)}
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
          {filteredModules.map((module) => (
            <ModuleComponent module={module} />
          ))}
        </SimpleGrid>
      </Box>
    </Layout>
  );
};

export default ModulesPage;

export const Head = () => <SEO />;
