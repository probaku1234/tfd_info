import React, { useEffect, useState } from "react";
import { useLocation } from "@reach/router";
import Layout from "../components/layout";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Input,
  Flex,
  Button,
  VStack,
  HStack,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { navigate, graphql, useStaticQuery } from "gatsby";
import { Descendant, Module } from "../types";
import ModuleComponent from "../components/module";
import { SEO } from "../components/seo";

interface DescendantModule {
  module_slot_id: string;
  module_id: string;
  module_enchant_level: number;
}

interface UserInfo {
  ouid: string;
  user_name: string;
  descendant_id: string;
  descendant_slot_id: string;
  descendant_level: number;
  module_max_capacity: number;
  module_capacity: number;
  module: (DescendantModule | Module)[];
}

interface UserProfile {
  ouid: string;
  user_name: string;
  platform_type: string;
  mastery_rank_level: number;
  mastery_rank_exp: number;
  title_prefix_id: string;
  title_suffix_id: string;
  os_language: string;
  game_language: string;
}

interface AllDescendantsData {
  nodes: Pick<
    Descendant,
    "descendant_id" | "descendant_name" | "descendant_image_url"
  >[];
}

interface AllModulesData {
  nodes: Module[];
}

const API_BASE_URL =
  process.env.NODE_ENV == "development"
    ? process.env.NEXON_API_BASE_URL
    : process.env.GATSBY_NEXON_API_BASE_URL;
const API_KEY =
  process.env.NODE_ENV == "development"
    ? process.env.NEXON_API_KEY
    : process.env.GATSBY_NEXON_API_KEY;
const moduleSlotIds = [
  "Skill 1",
  "Main 1",
  "Main 3",
  "Main 5",
  "Main 7",
  "Main 9",
  "Sub 1",
  "Main 2",
  "Main 4",
  "Main 6",
  "Main 8",
  "Main 10",
];
const UserInfoPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<(UserInfo & UserProfile) | null>(
    null
  );
  const [userOUId, setUserOUId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descendantData, setDescendantData] = useState(null);
  const [userName, setUserName] = useState<string | null>(
    query.get("user_name")
  );

  const { allDescendant, allModule } = useStaticQuery(graphql`
    query {
      allDescendant {
        nodes {
          descendant_id
          descendant_name
          descendant_image_url
        }
      }
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
  `);

  useEffect(() => {
    const fetchUserOUId = async () => {
      try {
        setError(null);

        const response = await axios.get(`/tfd/v1/id`, {
          headers: {
            "x-nxopen-api-key": API_KEY,
          },
          baseURL: API_BASE_URL,
          params: { user_name: userName },
        });
        setUserOUId(response.data.ouid as string);
      } catch (err) {
        setLoading(false);
        setError(`Failed to fetch user data ${err}`);
      }
      // setUserOUId(
      //   "8102e8f67c7128b13587299ded26367b80a172f3dc21dc82265c4aaf699f9ba4"
      // );
    };

    if (loading || userName) {
      fetchUserOUId();
    }
  }, [loading]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [descendantResponse, userProfileResponse] = await Promise.all([
          axios.get("tfd/v1/user/descendant", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId },
          }),
          axios.get("tfd/v1/user/basic", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId },
          }),
        ]);

        const combinedData: UserInfo & UserProfile = {
          ...descendantResponse.data,
          ...userProfileResponse.data,
        };
        combinedData.module.forEach(function (v, index, arr) {
          arr[index] = {
            ...v,
            ...getModuleData(v.module_id),
          };
        });

        setUserData(combinedData);
        //
        // const tempData: UserInfo & UserProfile = {
        //   ouid: "8102e8f67c7128b13587299ded26367b80a172f3dc21dc82265c4aaf699f9ba4",
        //   user_name: "바쿠#9236",
        //   descendant_id: "101000009",
        //   descendant_slot_id: "1",
        //   descendant_level: 28,
        //   module_max_capacity: 67,
        //   module_capacity: 67,
        //   module: [
        //     {
        //       module_slot_id: "Sub 1",
        //       module_id: "253003001",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 10",
        //       module_id: "251002100",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 8",
        //       module_id: "251001016",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 7",
        //       module_id: "251002034",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 2",
        //       module_id: "251001002",
        //       module_enchant_level: 7,
        //     },
        //     {
        //       module_slot_id: "Main 4",
        //       module_id: "251002017",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 9",
        //       module_id: "251003001",
        //       module_enchant_level: 9,
        //     },
        //     {
        //       module_slot_id: "Main 5",
        //       module_id: "251002074",
        //       module_enchant_level: 0,
        //     },
        //     {
        //       module_slot_id: "Main 6",
        //       module_id: "251001009",
        //       module_enchant_level: 10,
        //     },
        //     {
        //       module_slot_id: "Main 3",
        //       module_id: "251001036",
        //       module_enchant_level: 5,
        //     },
        //     {
        //       module_slot_id: "Main 1",
        //       module_id: "251003002",
        //       module_enchant_level: 8,
        //     },
        //     {
        //       module_slot_id: "Skill 1",
        //       module_id: "254009003",
        //       module_enchant_level: 10,
        //     },
        //   ],
        //   platform_type: "Steam",
        //   mastery_rank_level: 15,
        //   mastery_rank_exp: 25546,
        //   title_prefix_id: "270300003",
        //   title_suffix_id: "270310074",
        //   os_language: "English",
        //   game_language: "KO",
        // };

        // tempData.module.forEach(function (v, index, arr) {
        //   arr[index] = {
        //     ...v,
        //     ...getModuleData(v.module_id),
        //   };
        // });
        // setUserData(tempData);
      } catch (err) {
        console.error(`${API_BASE_URL} ${err}`);
        setError(`Failed to fetch user data ${err}`);
      } finally {
        setLoading(false);
      }
    };

    if (userOUId) {
      fetchUserData();
    }
  }, [userOUId]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (userName && userName.trim()) {
      const encodedUserId = encodeURIComponent(userName.trim());
      navigate(`/user_info?user_name=${encodedUserId}`, { replace: true });
      setLoading(true);
    }
  };

  const getDescendantData = (descendantId: string) => {
    return (allDescendant as AllDescendantsData).nodes.find(
      (descendant) => descendant.descendant_id === descendantId
    );
  };

  const getModuleData = (moduleId: string) => {
    return (allModule as AllModulesData).nodes.find(
      (module) => module.module_id === moduleId
    );
  };

  function descendantBasicInfo(descendantId: string) {
    const descendantData = getDescendantData(descendantId);

    return (
      <VStack>
        <Heading textColor={"white"}>
          {userData?.user_name}
          <Image
            src={`/images/${userData?.platform_type}.png`}
            alt={userData?.platform_type}
            width={"35px"}
            display={"inline"}
            pl={1}
          />
        </Heading>
        <Heading textColor={"white"}>{userData?.mastery_rank_level}</Heading>
        <Divider />
        <HStack>
          <Box
            alignItems={"center"}
            border="1px solid #fff"
            display={"flex"}
            justifyContent={"center"}
            transform={"rotate(45deg)"}
            height={"37px"}
            width={"37px"}
            mr={1}
          >
            <Text transform={"rotate(-45deg)"} textColor={"white"}>
              {userData?.descendant_level}
            </Text>
          </Box>
          <Heading textColor={"white"}>
            {descendantData?.descendant_name}
          </Heading>
        </HStack>
        <Image
          src={descendantData?.descendant_image_url}
          border={"2px solid #334155"}
          borderRadius={"50%"}
        />
        <Divider />
        <Heading textColor={"white"}>모듈 수용량</Heading>
        <Heading textColor={"white"}>
          {userData?.module_capacity} / {userData?.module_max_capacity}
        </Heading>
        <Divider />
        {/* <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Section 1 title
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text>asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfas</Text>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Section 2 title
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>asdfasdfasdfasdf</AccordionPanel>
          </AccordionItem>
        </Accordion> */}
      </VStack>
    );
  }

  const moudleBox = (slotId: string) => {
    const moduleOnSlot = userData?.module.find(
      (module) => (module as DescendantModule).module_slot_id === slotId
    );

    return moduleOnSlot ? (
      <ModuleComponent
        module={moduleOnSlot as Module}
        level={(moduleOnSlot as DescendantModule).module_enchant_level}
        showLevelBar
        showTooltip
      />
    ) : (
      <Image src={`/images/module.png`} />
    );
  };

  return (
    <Layout>
      <SEO
        title="유저 정보 검색"
        description={`유저 ${
          userData?.user_name || ""
        }의 장착 계승자 정보를 확인 할 수 있습니다.`}
      />
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4} textColor={"white"}>
          {userData ? `` : "유저 정보 검색"}
        </Heading>
        {!query.get("user_name") ? (
          <Box as="form" onSubmit={handleSearch}>
            <Flex justify="center">
              <Input
                placeholder="닉네임#1234"
                value={userName || ""}
                onChange={(e) => setUserName(e.target.value)}
                width="300px"
                mr={2}
                textColor={"white"}
              />
              <Button type="submit" colorScheme="teal">
                Search
              </Button>
            </Flex>
          </Box>
        ) : loading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text fontSize="xl" color="red.500">
            {error}
          </Text>
        ) : userData ? (
          <Box>
            <HStack spacing={8}>
              {descendantBasicInfo(userData.descendant_id)}
              <Tabs>
                <TabList>
                  <Tab textColor={"black"}>모듈</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <SimpleGrid columns={6} spacing={3}>
                      {moduleSlotIds.map((id) => (
                        <Box
                          border={"1px solid #627185"}
                          borderRadius={"5px"}
                          display={"flex"}
                          justifyContent={"center"}
                          maxWidth={"152px"}
                          minHeight={"153px"}
                          alignContent={"center"}
                        >
                          {moudleBox(id)}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </HStack>
          </Box>
        ) : (
          <Text fontSize="xl">No user data found</Text>
        )}
      </Box>
    </Layout>
  );
};

export default UserInfoPage;
