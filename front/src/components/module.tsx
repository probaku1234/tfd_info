import React from "react";
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
import { Module, ModuleStat } from "../types";

interface ModuleProps {
  module: Module;
  level?: number;
}

const tierColorMap = new Map<string, string>();
const classImageNameMap = new Map<string, string>();
const socketImageNameMap = new Map<string, string>();

tierColorMap.set(
  "일반",
  "linear-gradient(130deg, #3d6c8c 10%, #000 46%, #000 54%, #3d6c8c 90%)"
);
tierColorMap.set(
  "희귀",
  "linear-gradient(130deg, #511e7a 10%, #1a1a1a 46%, #1a1a1a 54%, #511e7a 90%)"
);
tierColorMap.set(
  "궁극",
  "linear-gradient(130deg, #988b5e 10%, #1a1a1a 46%, #1a1a1a 54%, #988b5e 90%)"
);
tierColorMap.set(
  "초월",
  "linear-gradient(150deg, #843e2f 10%, #1a1a1a 46%, #1a1a1a 54%, #843e2f 90%)"
);

socketImageNameMap.set("크산틱", "Xantic.png");
socketImageNameMap.set("세룰리안", "Cerulean.png");
socketImageNameMap.set("알만딘", "Almandine.png");
socketImageNameMap.set("말라카이트", "Malachite.png");
socketImageNameMap.set("루틸", "Rutile.png");

classImageNameMap.set("계승자", "module_descendant.png");
classImageNameMap.set("일반탄", "module_ammo_a.png");
classImageNameMap.set("충격탄", "module_ammo_b.png");
classImageNameMap.set("특수탄", "module_ammo_c.png");
classImageNameMap.set("고위력탄", "module_ammo_d.png");

const ModuleComponent: React.FC<ModuleProps> = ({ module, level=0 }) => {
  return (
    <Box
      key={module.module_id}
      bg="gray.700"
      border="1px solid"
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      cursor={"pointer"}
      _hover={{ borderColor: "red" }}
    >
      <Box
        textColor="white"
        position="absolute"
        bg="#090e25"
        border="1px solid #94a3b8"
        borderRadius="5px"
        gap="5px"
        justifyContent="center"
        display="flex"
        top="-0.5%"
      >
        <Image
          src={`/images/${socketImageNameMap.get(module.module_socket_type)}`}
          alt={module.module_socket_type}
          width="24px"
          height="24px"
        />
        <Text fontSize="lg">{module.module_stat[level].module_capacity}</Text>
      </Box>
      <Box
        bg={tierColorMap.get(module.module_tier)}
        border="2px solid #000"
        borderRadius="5px"
        mb={1}
      >
        <Image
          src={module.image_url}
          alt={module.module_name}
          boxSize="100px"
          mb={3}
        />
      </Box>

      <Text fontSize="md" fontWeight="bold" color="white" mb={1}>
        {module.module_name}
      </Text>
      <HStack spacing={1} mb={2}>
        <Image
          src={`/images/${classImageNameMap.get(module.module_class)}`}
          alt={module.module_class}
          width="40px"
          height="40px"
        />
      </HStack>
      <Box textColor="#94a3b8" borderRadius="0 0 10px 10px">
        {module.module_type ? module.module_type : "-"}
      </Box>
    </Box>
  );
};

export default ModuleComponent;
