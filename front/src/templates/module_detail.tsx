import React, { useState, useContext } from "react";
import { graphql, PageProps } from "gatsby";
import Layout from "../components/layout";
import { Box, Image, Text, Badge, VStack, HStack } from "@chakra-ui/react";
import { SEO } from "../components/seo";
import { ModuleWithLocale } from "../types";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import ModuleComponent from "../components/module";
import LocaleContext from "../context/locale_context";

interface ModuleDetailProps extends PageProps {
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

const ModuleDetail: React.FC<ModuleDetailProps> = ({ data, pageContext }) => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;

  const module = data.allModule.nodes.find(
    (m) => m.locale === locale && m.module_id === pageContext.module_id!
  );
  console.log(pageContext);
  const [level, setLevel] = useState(0);

  const handleArrowClick = (isLeft: boolean) => {
    if (isLeft) {
      if (level > 0) {
        setLevel(level - 1);
      }
    } else {
      if (level < module!.module_stat.length - 1) {
        setLevel(level + 1);
      }
    }
  };

  const seoDescription = translation[locale].seo_description.replace(
    "{module_name}",
    module ? module.module_name : ''
  );
  
  const translations = translation[locale] || translation.en;

  return (
    <Layout>
      <SEO
        title={module ? module.module_name : ''}
        description={seoDescription}
      />
      <Box p={5} minH="100vh" width={"100%"}>
        {module ? (
          <VStack spacing={4}>
            <HStack justifyContent="center" alignItems="center">
              <ArrowLeftIcon
                width={"10%"}
                height={"10%"}
                color={"white"}
                cursor={"pointer"}
                onClick={() => handleArrowClick(true)}
                mr={10}
                _hover={{ color: "gray" }}
              />
              <ModuleComponent module={module!} level={level} />
              <ArrowRightIcon
                width={"10%"}
                height={"10%"}
                color={"white"}
                cursor={"pointer"}
                onClick={() => handleArrowClick(false)}
                ml={10}
                _hover={{ color: "gray" }}
              />
            </HStack>

            {module!.module_stat.map((stat, index) => (
              <Box
                key={index}
                p={2}
                bg="gray.700"
                borderRadius="md"
                width="60%"
                textAlign="center"
                border={"1px solid"}
                borderColor={index === level ? "red" : ""}
              >
                <Text color="white">{translations.level}: {stat.level}</Text>
                <Text color="white">{translations.capacity}: {stat.module_capacity}</Text>
                <Text color="white">{stat.value}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <></>
        )}
      </Box>
    </Layout>
  );
};

export default ModuleDetail;

const translation: {
  [key: string]: { seo_description: string; level: string; capacity: string };
} = {
  ko: {
    seo_description: "퍼스트 디센던트의 {module_name} 모듈에 대한 통계, 기술 및 스케일링 세부 정보를 확인해보세요.",
    level: "강화 레벨",
    capacity: "수용량",
  },
  en: {
    seo_description: "Discover the stats, skills, and scaling details for the module {module_name} in The First Descendant.",
    level: "Enchant Level",
    capacity: "Capacity",
  },
};
