import React, { useEffect, useState, useCallback, useContext } from "react";
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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { SEO } from "../components/seo";
import { graphql, PageProps, navigate } from "gatsby";
import { Module, ModuleWithLocale } from "../types";
import ModuleComponent from "../components/module";
import { useLocation } from "@reach/router";
import LocaleContext from "../context/locale_context";
import "./modules.css";

interface ModulesPageProps extends PageProps {
  data: {
    allModule: {
      nodes: ModuleWithLocale[];
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
        locale
      }
    }
  }
`;

const ModulesPage: React.FC<ModulesPageProps> = ({ data }) => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;
  const modules = data.allModule.nodes;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedBorderColor = "red";
  const borderColor = "black";
  const translations = translation[locale] || translation.en;

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
  const [filteredModules, setFilteredModules] = useState<ModuleWithLocale[]>(
    []
  );

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
      let filtered = modules.filter((module) => module.locale === locale);

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
  }, [searchKeyword, tier, moduleClass, socket, modules, locale]);

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
      <SEO
        title={translations.seo_title}
        description={translations.seo_description}
        pathname="/modules"
      />
      <Box p={5} minH="100vh" width={"100%"}>
        <VStack spacing={4} mb={6}>
          <Wrap spacing={4} w="100%" justify="space-between">
            <WrapItem flex={1}>
              <Input
                placeholder={translations.search_placeholder}
                defaultValue={searchKeyword || ""}
                bg="gray.700"
                border="none"
                color="white"
                onChange={handleSearchInputChange}
              />
            </WrapItem>
            <WrapItem>
              <Select
                defaultValue={tier}
                onChange={(e) => setTier(e.target.value)}
                bg="gray.700"
                border="none"
                color="white"
              >
                <option value={"all"}>{translations.all}</option>
                <option
                  style={{ color: "#2895bb" }}
                  value={translations.standard}
                >
                  {translations.standard}
                </option>
                <option style={{ color: "#864ab7" }} value={translations.rare}>
                  {translations.rare}
                </option>
                <option
                  style={{ color: "#bf9138" }}
                  value={translations.ultimate}
                >
                  {translations.ultimate}
                </option>
                <option
                  style={{ color: "#b1543f" }}
                  value={translations.transcendent}
                >
                  {translations.transcendent}
                </option>
                {/* 추가 옵션들 */}
              </Select>
            </WrapItem>
            <WrapItem>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Filter by class"
                  onClick={() =>
                    onHandleClassIconClick(translations.descendant)
                  }
                  icon={
                    <Image
                      src="/images/module_descendant.png"
                      alt={translations.descendant}
                    />
                  }
                  bg="gray.700"
                  border={"1px solid"}
                  borderColor={
                    moduleClass === translations.descendant
                      ? selectedBorderColor
                      : borderColor
                  }
                  _hover={{ bg: "gray.600" }}
                />
                <IconButton
                  aria-label="Filter by class"
                  onClick={() =>
                    onHandleClassIconClick(translations.general_rounds)
                  }
                  icon={
                    <Image
                      src="/images/module_general rounds.png"
                      alt={translations.general_rounds}
                    />
                  }
                  bg="gray.700"
                  border={"1px solid"}
                  borderColor={
                    moduleClass === translations.general_rounds
                      ? selectedBorderColor
                      : borderColor
                  }
                  _hover={{ bg: "gray.600" }}
                />
                <IconButton
                  aria-label="Filter by class"
                  onClick={() =>
                    onHandleClassIconClick(translations.impact_rounds)
                  }
                  icon={
                    <Image
                      src="/images/module_impact rounds.png"
                      alt={translations.impact_rounds}
                    />
                  }
                  bg="gray.700"
                  border={"1px solid"}
                  borderColor={
                    moduleClass === translations.impact_rounds
                      ? selectedBorderColor
                      : borderColor
                  }
                  _hover={{ bg: "gray.600" }}
                />
                <IconButton
                  aria-label="Filter by class"
                  onClick={() =>
                    onHandleClassIconClick(translations.special_rounds)
                  }
                  icon={
                    <Image
                      src="/images/module_special rounds.png"
                      alt={translations.special_rounds}
                    />
                  }
                  bg="gray.700"
                  border={"1px solid"}
                  borderColor={
                    moduleClass === translations.special_rounds
                      ? selectedBorderColor
                      : borderColor
                  }
                  _hover={{ bg: "gray.600" }}
                />
                <IconButton
                  aria-label="Filter by class"
                  onClick={() =>
                    onHandleClassIconClick(translations.high_power_rounds)
                  }
                  icon={
                    <Image
                      src="/images/module_high-power rounds.png"
                      alt={translations.high_power_rounds}
                    />
                  }
                  bg="gray.700"
                  border={"1px solid"}
                  borderColor={
                    moduleClass === translations.high_power_rounds
                      ? selectedBorderColor
                      : borderColor
                  }
                  _hover={{ bg: "gray.600" }}
                />
              </HStack>
            </WrapItem>
            <WrapItem>
              <Select
                defaultValue={socket}
                onChange={(e) => setSocket(e.target.value)}
                bg="gray.700"
                border="none"
                color="white"
              >
                <option value="all">{translations.all}</option>
                <option value={translations.xantic}>
                  {translations.xantic}
                </option>
                <option value={translations.cerulean}>
                  {translations.cerulean}
                </option>
                <option value={translations.almandine}>
                  {translations.almandine}
                </option>
                <option value={translations.malachite}>
                  {translations.malachite}
                </option>
                <option value={translations.rutile}>
                  {translations.rutile}
                </option>
              </Select>
            </WrapItem>
          </Wrap>
        </VStack>

        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 7 }} spacing={5}>
          {filteredModules.map((module) => (
            <ModuleComponent
              module={module}
              key={`${module.module_id}/${locale}`}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Layout>
  );
};

export default ModulesPage;

const translation: {
  [key: string]: {
    all: string;
    standard: string;
    rare: string;
    ultimate: string;
    transcendent: string;
    descendant: string;
    general_rounds: string;
    impact_rounds: string;
    special_rounds: string;
    high_power_rounds: string;
    xantic: string;
    cerulean: string;
    almandine: string;
    malachite: string;
    rutile: string;
    search_placeholder: string;
    seo_title: string;
    seo_description: string;
  };
} = {
  ko: {
    all: "전체",
    standard: "일반",
    rare: "희귀",
    ultimate: "궁극",
    transcendent: "초월",
    descendant: "계승자",
    general_rounds: "일반탄",
    impact_rounds: "충격탄",
    special_rounds: "특수탄",
    high_power_rounds: "고위력탄",
    xantic: "크산틱",
    cerulean: "세룰리안",
    almandine: "알만딘",
    malachite: "말라카이트",
    rutile: "루틸",
    search_placeholder: "검색",
    seo_title: "퍼스트 디센던트 모듈 리스트",
    seo_description:
      "희귀도와 유형을 포함한 퍼스트 디센던트 모듈의 전체 목록을 확인해보세요. 강화 레벨에 따른 상세한 퍼스트 디센던트 모듈 통계를 볼 수 있습니다.",
  },
  en: {
    all: "all",
    standard: "Standard",
    rare: "Rare",
    ultimate: "Ultimate",
    transcendent: "Transcendent",
    descendant: "Descendant",
    general_rounds: "General Rounds",
    impact_rounds: "Impact Rounds",
    special_rounds: "Special Rounds",
    high_power_rounds: "High-Power Rounds",
    xantic: "Xantic",
    cerulean: "Cerulean",
    almandine: "Almandine",
    malachite: "Malachite",
    rutile: "Rutile",
    search_placeholder: "Search by stats or name",
    seo_title: "TFD Modules List",
    seo_description:
      "Discover the complete list of The First Descendant modules, including rarity and type. Explore detailed TFD module stats with enchant level.",
  },
};
