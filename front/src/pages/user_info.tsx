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
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import axios from "axios";
import { navigate, graphql, useStaticQuery } from "gatsby";
import {
  DescendantWithLocale,
  ExternalComponentWithLocale,
  ModuleWithLocale,
  ReactorWithLocale,
  StatWithLocale,
  WeaponWithLocale,
} from "../types";
import ModuleComponent from "../components/module";
import { SEO } from "../components/seo";
import * as useInfoStyles from "./use_info.module.css";
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

interface UserExternalComponent {
  ouid: string;
  user_name: string;
  external_component: {
    external_component_slot_id: string;
    external_component_id: string;
    external_component_level: number;
    external_component_additional_stat: {
      additional_stat_name: string;
      additional_stat_value: string;
    }[];
  }[];
}

interface UserWeapon {
  module_max_capacity: number;
  module_capacity: number;
  weapon_slot_id: string;
  weapon_id: string;
  weapon_level: number;
  perk_ability_enchant_level: number;
  weapon_additional_stat: {
    additional_stat_name: string;
    additional_stat_value: string;
  }[];
  module: DescendantModule[];
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
interface AllExternalComponentsData {
  nodes: ExternalComponentWithLocale[];
}

interface AllStatsData {
  nodes: StatWithLocale[];
}

interface AllWeaponData {
  nodes: WeaponWithLocale[];
}

interface UserCombinedReactorDataWithLocale {
  ko: UserReactor & ReactorWithLocale;
  en: UserReactor & ReactorWithLocale;
}

interface UserCombinedExternalComponentsDataWithLocale {
  ko: (
    | UserExternalComponent["external_component"][number] &
        ExternalComponentWithLocale
  )[];
  en: (
    | UserExternalComponent["external_component"][number] &
        ExternalComponentWithLocale
  )[];
}

interface UserCombinedWeaponDataWithLocale {
  ko: (UserWeapon & WeaponWithLocale)[];
  en: (UserWeapon & WeaponWithLocale)[];
}

const API_BASE_URL =
  process.env.NODE_ENV == "development"
    ? process.env.NEXON_API_BASE_URL
    : process.env.GATSBY_NEXON_API_BASE_URL;
const API_KEY =
  process.env.NODE_ENV == "development"
    ? process.env.NEXON_API_KEY
    : process.env.GATSBY_NEXON_API_KEY;
const descendantModuleSlotIds = [
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
const weaponModuleSlotIds = ["1", "3", "5", "7", "9", "2", "4", "6", "8", "10"];

const getImageBgColor = (tier: string) => {
  switch (tier) {
    case "일반":
    case "Standard":
      return "linear-gradient(180deg, #030621 53%, rgba(40, 149, 187, .384))";
    case "희귀":
    case "Rare":
      return "linear-gradient(180deg, #030621 53%, rgba(81, 30, 122, .384))";
    case "궁극":
    case "Ultimate":
      return "linear-gradient(326deg, #030621 -1%, rgba(152, 139, 94, 0.64))";
    default:
      return "gray.700";
  }
};

const getBoxShadowByModuleSlotId = (slotId: string) => {
  switch (slotId) {
    case "Sub 1":
      return "0 -5px 25px 0 rgba(170,56,27,.8)";
    case "Skill 1":
      return "0 -5px 25px 0 rgba(50, 180, 104, .8)";
    default:
      return "";
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
  const [userExternalComponentData, setUserExternalComponentData] =
    useState<UserCombinedExternalComponentsDataWithLocale | null>(null);
  const [userWeaponData, setUserWeaponData] =
    useState<UserCombinedWeaponDataWithLocale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descendantData, setDescendantData] = useState(null);
  const [userName, setUserName] = useState<string | null>(
    query.get("user_name")
  );

  const {
    allDescendant,
    allModule,
    allReactor,
    allExternalComponent,
    allStat,
    allWeapon,
  } = useStaticQuery(graphql`
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
      allExternalComponent {
        nodes {
          external_component_id
          external_component_name
          image_url
          external_component_equipment_type
          external_component_tier
          base_stat {
            level
            stat_id
            stat_value
          }
          set_option_detail {
            set_option
            set_count
            set_option_effect
          }
          locale
        }
      }
      allStat {
        nodes {
          stat_id
          stat_name
          locale
        }
      }
      allWeapon {
        nodes {
          weapon_id
          weapon_name
          image_url
          weapon_type
          weapon_tier
          weapon_rounds_type
          firearm_atk {
            level
            firearm {
              firearm_atk_type
              firearm_atk_value
            }
          }
          weapon_perk_ability_name
          weapon_perk_ability_description
          weapon_perk_ability_image_url
          locale
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

    const fetchExternalComponentsData = async () => {
      try {
        const [
          userExternalComponentsKoResponse,
          userExternalComponentsEnResponse,
        ] = await Promise.all([
          axios.get("tfd/v1/user/external-component", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId, language_code: "ko" },
          }),
          axios.get("tfd/v1/user/external-component", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId, language_code: "en" },
          }),
        ]);

        const externalComponentKoData: UserExternalComponent =
          userExternalComponentsKoResponse.data;
        const externalComponentEnData: UserExternalComponent =
          userExternalComponentsEnResponse.data;

        const combinedData = {
          ko: externalComponentKoData.external_component.map((data) => ({
            ...data,
            ...getExternalComponentData(data.external_component_id, "ko")!,
          })),
          en: externalComponentEnData.external_component.map((data) => ({
            ...data,
            ...getExternalComponentData(data.external_component_id, "en")!,
          })),
        };
        setUserExternalComponentData(combinedData);
      } catch (err) {
        setError(`Failed to fetch user data ${err}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchWeaponData = async () => {
      try {
        const [userWeaponKoResponse, userWeaponEnResponse] = await Promise.all([
          axios.get("tfd/v1/user/weapon", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId, language_code: "ko" },
          }),
          axios.get("tfd/v1/user/weapon", {
            headers: {
              "x-nxopen-api-key": API_KEY,
            },
            baseURL: API_BASE_URL,
            params: { ouid: userOUId, language_code: "en" },
          }),
        ]);

        const weaponKoData = userWeaponKoResponse.data;
        const weaponEnData = userWeaponEnResponse.data;

        const combinedData = {
          ko: (weaponKoData.weapon as UserWeapon[]).map((data) => ({
            ...data,
            ...getWeaponData(data.weapon_id, "ko")!,
          })),
          en: (weaponEnData.weapon as UserWeapon[]).map((data) => ({
            ...data,
            ...getWeaponData(data.weapon_id, "en")!,
          })),
        };
        setUserWeaponData(combinedData);
      } catch (err) {
        setError(`Failed to fetch user data ${err}`);
      } finally {
        setLoading(false);
      }
    };

    if (userOUId) {
      fetchUserData();
      fetchReactorData();
      fetchExternalComponentsData();
      fetchWeaponData();
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

  const getExternalComponentData = (
    componentId: string,
    locale: "ko" | "en"
  ) => {
    return (allExternalComponent as AllExternalComponentsData).nodes.find(
      (externalComponent) =>
        externalComponent.external_component_id === componentId &&
        externalComponent.locale === locale
    );
  };

  const getStatData = (statId: string) => {
    return (allStat as AllStatsData).nodes.find(
      (stat) => stat.stat_id === statId && stat.locale === locale
    );
  };

  const getWeaponData = (weaponId: string, locale: "ko" | "en") => {
    return (allWeapon as AllWeaponData).nodes.find(
      (weapon) => weapon.weapon_id === weaponId && weapon.locale === locale
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

  const moduleSlotIdBox = (slotId: string) => {
    return (
      <Box
        boxShadow={getBoxShadowByModuleSlotId(slotId)}
        className={useInfoStyles.module_slot_box}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position={"relative"}
      >
        <Text textColor={"white"}>{slotId}</Text>
      </Box>
    );
  };

  const descendantModuleBox = (slotId: string) => {
    const moduleOnSlot = userData?.module.find(
      (module) => (module as DescendantModule).module_slot_id === slotId
    );

    return moduleOnSlot ? (
      <Box>
        <ModuleComponent
          module={moduleOnSlot as ModuleWithLocale}
          level={(moduleOnSlot as DescendantModule).module_enchant_level}
          showLevelBar
          showTooltip
          forModuleGrid
        />
        {moduleSlotIdBox(slotId)}
      </Box>
    ) : (
      <Box>
        <Image
          src={`/images/module.png`}
          className={useInfoStyles.module_grid}
        />
        {moduleSlotIdBox(slotId)}
      </Box>
    );
  };

  const weaponModuleBox = (slotId: string, weaponIndex: number) => {
    const moduleOnSlotId = weaponData
      ?.at(weaponIndex)
      ?.module.find((module) => module.module_slot_id === slotId);

    const moduleOnSlot = getModuleData(moduleOnSlotId?.module_id || "");

    return moduleOnSlot ? (
      <Box>
        <ModuleComponent
          module={moduleOnSlot as ModuleWithLocale}
          level={moduleOnSlotId?.module_enchant_level}
          showLevelBar
          showTooltip
          forModuleGrid
        />
        {moduleSlotIdBox(slotId)}
      </Box>
    ) : (
      <Box>
        <Image
          src={`/images/module.png`}
          className={useInfoStyles.module_grid}
        />
        {moduleSlotIdBox(slotId)}
      </Box>
    );
  };

  const setEffectBox = () => {
    return Object.keys(setEffectCount).map((key) => {
      const count = setEffectCount[key];
      const head = (
        <Heading as="h3" size="lg">
          {key}
        </Heading>
      );
      if (count == 4) {
        return (
          <Box key={key}>
            {head}
            <Heading as="h4" size="md">
              {setEffectMap[key][2]}
            </Heading>
            <Heading as="h4" size="md">
              {setEffectMap[key][4]}
            </Heading>
          </Box>
        );
      } else if (count == 2 || count == 3) {
        return (
          <Box key={key}>
            {head}
            <Heading as="h4" size="md">
              {setEffectMap[key][2]}
            </Heading>
          </Box>
        );
      }
    });
  };

  const reactorData: (UserReactor & ReactorWithLocale) | null = userReactorData
    ? userReactorData[locale as keyof UserCombinedReactorDataWithLocale]
    : null;

  const externalComponentData:
    | (
        | {
            external_component_slot_id: string;
            external_component_id: string;
            external_component_level: number;
            external_component_additional_stat: {
              additional_stat_name: string;
              additional_stat_value: string;
            }[];
          }
        | ExternalComponentWithLocale
      )[]
    | null = userExternalComponentData
    ? userExternalComponentData[
        locale as keyof UserCombinedExternalComponentsDataWithLocale
      ]
    : null;
  const weaponData: (UserWeapon & WeaponWithLocale)[] | null = userWeaponData
    ? userWeaponData[locale as keyof UserCombinedWeaponDataWithLocale]
    : null;

  const setEffectMap: {
    [key: string]: {
      [key: number]: string;
    };
  } = {};
  const setEffectCount: {
    [key: string]: number;
  } = {};

  externalComponentData?.forEach((component) => {
    if (component.set_option_detail.length != 0) {
      const setOptionDetail = component.set_option_detail[0];
      if (!setEffectCount[setOptionDetail.set_option]) {
        setEffectCount[setOptionDetail.set_option] = 0;
      }
      setEffectCount[setOptionDetail.set_option] =
        setEffectCount[setOptionDetail.set_option] + 1;
    }
    component.set_option_detail.forEach((option) => {
      if (!setEffectMap[option.set_option]) {
        setEffectMap[option.set_option] = {};
      }

      // Map set_count to the set_option_effect
      setEffectMap[option.set_option][option.set_count] =
        option.set_option_effect;
    });
  });

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
          <>
            <Box as="form" onSubmit={handleSearch}>
              <Flex
                justify="center"
                direction={{ base: "column", md: "row" }}
                align="center"
              >
                <Input
                  placeholder={translations.search_placeholder}
                  value={userName || ""}
                  onChange={(e) => setUserName(e.target.value)}
                  width={{ base: "100%", md: "300px" }} // Full width on small screens, 300px on medium and larger screens
                  mr={{ base: 0, md: 2 }} // Remove right margin on small screens
                  mb={{ base: 2, md: 0 }}
                  textColor={"white"}
                />
                <Button type="submit" colorScheme="gray">
                  {translations.search_button}
                </Button>
              </Flex>
            </Box>
            <Flex mt={4} justify={"center"}>
              <Alert
                status="info"
                width={"70%"}
                bg={"#d7d7d7"}
                borderRadius={"10px"}
              >
                <AlertIcon />
                <Box>
                  <AlertTitle>{translations.info_title}</AlertTitle>
                  <AlertDescription>
                    {translations.info_message}
                  </AlertDescription>
                </Box>
              </Alert>
            </Flex>
          </>
        ) : loading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text fontSize="xl" color="red.500">
            {error}
          </Text>
        ) : userData ? (
          <Box>
            <Stack
              direction={{ base: "column", md: "row" }} // Vertical on mobile, horizontal on desktop
              spacing={4} // Add spacing between the items
              align="stretch"
            >
              {descendantBasicInfo(userData.descendant_id)}
              <Tabs>
                <TabList>
                  <Wrap>
                    <WrapItem>
                      <Tab
                        textColor={"white"}
                        _selected={{ borderColor: "blue.500" }}
                      >
                        {translations.module}
                      </Tab>
                    </WrapItem>
                    <WrapItem>
                      <Tab
                        textColor={"white"}
                        _selected={{ borderColor: "blue.500" }}
                      >
                        {translations.reactor}
                      </Tab>
                    </WrapItem>
                    <WrapItem>
                      <Tab
                        textColor={"white"}
                        _selected={{ borderColor: "blue.500" }}
                      >
                        {translations.external_component}
                      </Tab>
                    </WrapItem>
                    {weaponData?.map((weapon) => (
                      <WrapItem>
                        <Tab
                          key={weapon.weapon_slot_id}
                          textColor={"white"}
                          _selected={{ borderColor: "blue.500" }}
                        >
                          {translations.weapon} {weapon.weapon_slot_id}
                        </Tab>
                      </WrapItem>
                    ))}
                  </Wrap>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <SimpleGrid
                      columns={{ sm: 1, md: 2, lg: 3, xl: 6 }}
                      spacing={3}
                      justifyContent={"center"}
                    >
                      {descendantModuleSlotIds.map((id) => (
                        <Box
                          key={id}
                          border={"1px solid #627185"}
                          borderRadius={"5px"}
                          display={"flex"}
                          justifyContent={"center"}
                          maxWidth={"152px"}
                          minHeight={"153px"}
                          alignContent={"center"}
                        >
                          {descendantModuleBox(id)}
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
                  {/* External Component */}
                  <TabPanel>
                    <Stack
                      direction={{ base: "column", md: "row" }} // Vertical on mobile, horizontal on desktop
                      spacing={4} // Add spacing between the items
                      align="stretch"
                    >
                      {externalComponentData?.map((data) => (
                        <Box
                          key={data.external_component_id}
                          textColor={"white"}
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          ml={1}
                          mr={1}
                        >
                          <Image
                            src={
                              (data as ExternalComponentWithLocale).image_url
                            }
                            bg={getImageBgColor(
                              (data as ExternalComponentWithLocale)
                                .external_component_tier
                            )}
                            alt={
                              (data as ExternalComponentWithLocale)
                                ?.external_component_name
                            }
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
                                {
                                  (
                                    data as UserExternalComponent["external_component"][number]
                                  )?.external_component_level
                                }
                              </Text>
                            </Box>
                            <Heading>
                              {
                                (data as ExternalComponentWithLocale)
                                  ?.external_component_name
                              }
                            </Heading>
                          </HStack>
                          <HStack justifyContent="space-between" width="100%">
                            <Text fontSize="2xl">
                              {
                                getStatData(
                                  (data as ExternalComponentWithLocale)
                                    .base_stat[
                                    (
                                      data as UserExternalComponent["external_component"][number]
                                    ).external_component_level
                                  ].stat_id
                                )?.stat_name
                              }
                            </Text>
                            <Text fontSize="2xl">
                              {
                                (data as ExternalComponentWithLocale).base_stat[
                                  (
                                    data as UserExternalComponent["external_component"][number]
                                  ).external_component_level
                                ].stat_value
                              }
                            </Text>
                          </HStack>
                          {(
                            data as UserExternalComponent["external_component"][number]
                          ).external_component_additional_stat.map(
                            (component) => (
                              <HStack
                                key={component.additional_stat_name}
                                justifyContent="space-between"
                                width="100%"
                              >
                                <Text fontSize="2xl">
                                  {component.additional_stat_name}
                                </Text>
                                <Text fontSize="2xl">
                                  {component.additional_stat_value}
                                </Text>
                              </HStack>
                            )
                          )}
                        </Box>
                      ))}
                    </Stack>
                    <Divider />
                    <Box textColor={"white"} mt={2}>
                      <Heading>{translations.set_effect}</Heading>
                      {setEffectBox()}
                    </Box>
                  </TabPanel>
                  {/* Weapon */}
                  {weaponData?.map((weapon, index) => (
                    <TabPanel key={weapon.weapon_id}>
                      <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={8}
                        align={"stretch"}
                      >
                        <Image
                          src={weapon.image_url}
                          bg={getImageBgColor(weapon.weapon_tier)}
                          alt={weapon.weapon_name}
                          width={{ base: "100%", md: "50%" }}
                        />
                        <Box
                          textColor={"white"}
                          width={{ base: "100%", md: "50%" }}
                        >
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
                                {weapon?.weapon_level}
                              </Text>
                            </Box>
                            <Heading>{weapon?.weapon_name}</Heading>
                          </HStack>
                          <Text>
                            {weapon?.weapon_type} {weapon?.weapon_rounds_type}
                          </Text>
                          <HStack justifyContent="space-between" width="100%">
                            <Text fontSize="2xl">
                              {
                                getStatData(
                                  weapon?.firearm_atk?.at(
                                    weapon.weapon_level - 1
                                  )?.firearm[0].firearm_atk_type!
                                )?.stat_name
                              }
                            </Text>
                            <Text fontSize="2xl">
                              {
                                weapon?.firearm_atk?.at(weapon.weapon_level - 1)
                                  ?.firearm[0].firearm_atk_value
                              }
                            </Text>
                          </HStack>
                          {weapon?.weapon_additional_stat.map((stat) => (
                            <HStack
                              key={stat.additional_stat_name}
                              justifyContent="space-between"
                              width="100%"
                            >
                              <Text fontSize="2xl">
                                {stat.additional_stat_name}
                              </Text>
                              <Text fontSize="2xl">
                                {stat.additional_stat_value}
                              </Text>
                            </HStack>
                          ))}
                          {weapon?.weapon_perk_ability_name ? (
                            <HStack>
                              <Tooltip
                                label={weapon.weapon_perk_ability_description}
                              >
                                <Image
                                  src={weapon.weapon_perk_ability_image_url}
                                  alt={weapon.weapon_perk_ability_name}
                                />
                              </Tooltip>
                              <Text fontSize="2xl">
                                {weapon.weapon_perk_ability_name}
                              </Text>
                            </HStack>
                          ) : (
                            <></>
                          )}
                        </Box>
                      </Stack>
                      <Divider mb={3} />
                      <SimpleGrid
                        columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
                        spacing={2}
                        justifyContent={"center"}
                      >
                        {weaponModuleSlotIds.map((id) => (
                          <Box
                            key={id}
                            border={"1px solid #627185"}
                            borderRadius={"5px"}
                            display={"flex"}
                            justifyContent={"center"}
                            maxWidth={"152px"}
                            minHeight={"153px"}
                            alignContent={"center"}
                          >
                            {weaponModuleBox(id, index)}
                          </Box>
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </Stack>
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
    external_component: string;
    set_effect: string;
    weapon: string;
    info_title: string;
    info_message: string;
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
    external_component: "외장 부품",
    set_effect: "세트 효과",
    weapon: "무기",
    info_title: "현재 장착중인 계승자와 모듈, 무기, 외장 부품을 보여줍니다.",
    info_message:
      "참고: 이 페이지에 표시되는 정보는 유저의 로드아웃 변경에 따라 언제든지 달라질 수 있습니다. 최신 상태를 확인하려면 페이지를 새로고침하세요.",
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
    external_component: "External Component",
    set_effect: "Set Effect",
    weapon: "Weapon",
    info_title:
      "Displays the currently equipped Descendant, Module, Weapon, and External Components.",
    info_message:
      "Note: The information displayed on this page may change at any time based on the user's loadout changes. Please refresh the page to view the most up-to-date information.",
  },
};
