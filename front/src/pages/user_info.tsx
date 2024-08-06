import React, { useContext, useEffect, useState } from "react";
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
import {
  DescendantWithLocale,
  ModuleWithLocale,
  ReactorWithLocale,
} from "../types";
import ModuleComponent from "../components/module";
import { SEO } from "../components/seo";
import LocaleContext from "../context/locale_context";

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
  module: (DescendantModule | ModuleWithLocale)[];
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

interface UserReactor {
  ouid: string;
  user_name: string;
  reactor_id: string;
  reactor_slot_id: string;
  reactor_level: number;
  reactor_additional_stat: {
    additional_stat_name: string;
    additional_stat_value: string;
  }[];
  reactor_enchant_level: number;
}

interface AllDescendantsData {
  nodes: Pick<
    DescendantWithLocale,
    "descendant_id" | "descendant_name" | "descendant_image_url" | "locale"
  >[];
}

interface AllModulesData {
  nodes: ModuleWithLocale[];
}

interface AllReactorsData {
  nodes: ReactorWithLocale[];
}

interface UserCombinedReactorDataWithLocale {
  ko: UserReactor & ReactorWithLocale;
  en: UserReactor & ReactorWithLocale;
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

const getImageBgColor = (tier: string) => {
  switch (tier) {
    case "Standard" || "일반":
      return "linear-gradient(180deg, #030621 53%, rgba(40, 149, 187, .384))";
    case "Rare" || "희귀":
      return "linear-gradient(180deg, #030621 53%, rgba(81, 30, 122, .384))";
    case "Ultimate" || "궁극":
      return "linear-gradient(326deg, #030621 -1%, rgba(152, 139, 94, 0.64))";
    default:
      return "gray.700";
  }
};

const UserInfoPage = () => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<(UserInfo & UserProfile) | null>(
    null
  );
  const [userOUId, setUserOUId] = useState<string | null>(null);
  const [userReactorData, setUserReactorData] =
    useState<UserCombinedReactorDataWithLocale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descendantData, setDescendantData] = useState(null);
  const [userName, setUserName] = useState<string | null>(
    query.get("user_name")
  );

  const { allDescendant, allModule, allReactor } = useStaticQuery(graphql`
    query {
      allDescendant {
        nodes {
          descendant_id
          descendant_name
          descendant_image_url
          locale
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
          locale
        }
      }
      allReactor {
        nodes {
          reactor_id
          reactor_name
          locale
          image_url
          reactor_tier
          reactor_skill_power {
            level
            skill_atk_power
            sub_skill_atk_power
          }
          optimized_condition_type
        }
      }
    }
  `);

  const seoDescription = translation[locale].seo_description.replace(
    "{user_name}",
    userName ? userName : ""
  );

  const translations = translation[locale] || translation.en;

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

        // const data: UserReactor = {
        //   ouid: "8102e8f67c7128b13587299ded26367b80a172f3dc21dc82265c4aaf699f9ba4",
        //   user_name: "바쿠#9236",
        //   reactor_id: "245001666",
        //   reactor_slot_id: "1",
        //   reactor_level: 100,
        //   reactor_additional_stat: [
        //     {
        //       additional_stat_name: "보조공격 위력",
        //       additional_stat_value: "16.100",
        //     },
        //     {
        //       additional_stat_name: "스킬 재사용 대기시간",
        //       additional_stat_value: "-0.074",
        //     },
        //   ],
        //   reactor_enchant_level: 0,
        // };

        // const combinedData = {
        //   ...data,
        //   ...getReactorData(data.reactor_id)!,
        // };
        // setUserReactorData(combinedData);
      } catch (err) {
        setError(`Failed to fetch user data ${err}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchReactorData = async () => {
      try {
        const [userReactorKoResponse, userReactorEnResponse] =
          await Promise.all([
            axios.get("tfd/v1/user/reactor", {
              headers: {
                "x-nxopen-api-key": API_KEY,
              },
              baseURL: API_BASE_URL,
              params: { ouid: userOUId, language_code: "ko" },
            }),
            axios.get("tfd/v1/user/reactor", {
              headers: {
                "x-nxopen-api-key": API_KEY,
              },
              baseURL: API_BASE_URL,
              params: { ouid: userOUId, language_code: "en" },
            }),
          ]);

        const reactorKoData: UserReactor = userReactorKoResponse.data;
        const reactorEnData: UserReactor = userReactorEnResponse.data;

        const combinedData = {
          ko: {
            ...reactorKoData,
            ...getReactorData(reactorKoData.reactor_id, "ko")!,
          },
          en: {
            ...reactorEnData,
            ...getReactorData(reactorKoData.reactor_id, "en")!,
          },
        };
        setUserReactorData(combinedData);
      } catch (err) {
        setError(`Failed to fetch user data ${err}`);
      } finally {
        setLoading(false);
      }
    };

    if (userOUId) {
      fetchUserData();
      fetchReactorData();
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
      (descendant) =>
        descendant.descendant_id === descendantId &&
        descendant.locale === locale
    );
  };

  const getModuleData = (moduleId: string) => {
    return (allModule as AllModulesData).nodes.find(
      (module) => module.module_id === moduleId && module.locale === locale
    );
  };

  const getReactorData = (reactorId: string, locale: "ko" | "en") => {
    return (allReactor as AllReactorsData).nodes.find(
      (reactor) => reactor.reactor_id === reactorId && reactor.locale === locale
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
        <Heading textColor={"white"}>{translations.capacity}</Heading>
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
        module={moduleOnSlot as ModuleWithLocale}
        level={(moduleOnSlot as DescendantModule).module_enchant_level}
        showLevelBar
        showTooltip
      />
    ) : (
      <Image src={`/images/module.png`} />
    );
  };

  const reactorData: (UserReactor & ReactorWithLocale) | null = userReactorData
    ? userReactorData[locale as keyof UserCombinedReactorDataWithLocale]
    : null;

  return (
    <Layout>
      <SEO
        title={translations.seo_title}
        description={seoDescription}
        pathname="/user_info"
      />
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4} textColor={"white"}>
          {userData ? `` : translations.head}
        </Heading>
        {!query.get("user_name") ? (
          <Box as="form" onSubmit={handleSearch}>
            <Flex justify="center">
              <Input
                placeholder={translations.search_placeholder}
                value={userName || ""}
                onChange={(e) => setUserName(e.target.value)}
                width="300px"
                mr={2}
                textColor={"white"}
              />
              <Button type="submit" colorScheme="teal">
                {translations.search_button}
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
                  <Tab textColor={"white"}>{translations.module}</Tab>
                  <Tab textColor={"white"}>{translations.reactor}</Tab>
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
                  <TabPanel>
                    <Box
                      textColor={"white"}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Image
                        src={reactorData?.image_url}
                        bg={getImageBgColor(reactorData?.reactor_tier || "")}
                      />
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
                          <Text transform={"rotate(-45deg)"}>
                            {reactorData?.reactor_level}
                          </Text>
                        </Box>
                        <Heading>{reactorData?.reactor_name}</Heading>
                      </HStack>
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontSize="2xl">
                          {translations.skill_atk_power}
                        </Text>
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_skill_power?.at(
                              reactorData.reactor_level - 1
                            )?.skill_atk_power
                          }
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontSize="2xl">
                          {translations.sub_skill_power}
                        </Text>
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_skill_power?.at(
                              reactorData.reactor_level - 1
                            )?.sub_skill_atk_power
                          }
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontSize="2xl">
                          {translations.optimized_condition}
                        </Text>
                        <Text fontSize="2xl">
                          {reactorData?.optimized_condition_type}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_additional_stat?.at(0)
                              ?.additional_stat_name
                          }
                        </Text>
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_additional_stat?.at(0)
                              ?.additional_stat_value
                          }
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_additional_stat?.at(1)
                              ?.additional_stat_name
                          }
                        </Text>
                        <Text fontSize="2xl">
                          {
                            reactorData?.reactor_additional_stat?.at(1)
                              ?.additional_stat_value
                          }
                        </Text>
                      </HStack>
                    </Box>
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

const translation: {
  [key: string]: {
    seo_title: string;
    seo_description: string;
    head: string;
    search_placeholder: string;
    search_button: string;
    module: string;
    level: string;
    capacity: string;
    reactor: string;
    skill_atk_power: string;
    sub_skill_power: string;
    optimized_condition: string;
  };
} = {
  ko: {
    seo_title: "퍼스트 디센던트 유저 정보 검색",
    seo_description:
      "퍼스트 디센던트 유저 {user_name}의 장착 계승자 정보입니다. 해당 유저가 사용하는 모듈과 무기, 반응로, 외장부품을 살펴보세요.",
    head: "유저 정보 검색",
    search_placeholder: "닉네임#1234",
    search_button: "검색",
    module: "모듈",
    level: "강화 레벨",
    capacity: "모듈 수용량",
    reactor: "반응로",
    skill_atk_power: "스킬 위력",
    sub_skill_power: "보조공격 위력",
    optimized_condition: "최적화 조건",
  },
  en: {
    seo_title: "TFD Search For User Information",
    seo_description:
      "TFD User {user_name}'s equipped descendant information. Explore the modules, weapons, reactors, and external parts used by the user.",
    head: "Search For User Information",
    search_placeholder: "Nickname#1234",
    search_button: "Search",
    module: "Module",
    level: "Enchant Level",
    capacity: "Capacity",
    reactor: "Reactor",
    skill_atk_power: "Skill Attack Power",
    sub_skill_power: "Sub Skill Power",
    optimized_condition: "Optimized Condition",
  },
};
