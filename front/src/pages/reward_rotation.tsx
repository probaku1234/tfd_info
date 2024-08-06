import React, { useState, useEffect, useContext } from "react";
import { graphql, useStaticQuery, navigate } from "gatsby";
import { DateTime, Interval } from "ts-luxon";
import Layout from "../components/layout";
import {
  Box,
  Heading,
  Select,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Divider,
  Image,
} from "@chakra-ui/react";
import { useLocation } from "@reach/router";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { SEO } from "../components/seo";
import LocaleContext from "../context/locale_context";
import { MapDataWithLocale, Reward, MapData } from "../types";
import "./reward_rotation.css";

interface AllRewardWithLocale {
  allReward: {
    nodes: MapDataWithLocale[];
  };
}

const initialRotationStartDate = DateTime.fromMillis(1718694000000);
const totalRotations = 20;

const calculateRotationNumber = (dateToCheck: DateTime): number => {
  const initialDateTime = initialRotationStartDate;
  const diffInWeeks = dateToCheck.diff(initialDateTime, "weeks").weeks;

  const rotationNumber = (Math.floor(diffInWeeks) % totalRotations) + 1;
  return rotationNumber;
};

const calculateNextTuesday4PM = () => {
  let now = DateTime.local();
  let nextTuesday = now.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });

  if (now.weekday === 2 && now.hour < 16) {
    nextTuesday = now.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
  } else {
    if (now.weekday < 2) {
      nextTuesday = now.set({
        weekday: 2,
        hour: 16,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    } else {
      nextTuesday = now
        .plus({ weeks: 1 })
        .set({ weekday: 2, hour: 16, minute: 0, second: 0, millisecond: 0 });
    }
  }

  return nextTuesday;
};

const calculateDurationBasedOnOffset = (offset: number) => {
  const currentDurationEnd = calculateNextTuesday4PM();
  const currentDurationStart = currentDurationEnd.minus({
    weeks: 1,
  });

  return [
    currentDurationStart.plus({ weeks: 1 * offset }),
    currentDurationEnd.plus({ weeks: 1 * offset }),
  ];
};

function getRewardInfoByType(reward: any) {
  const imageName = rewardTypeNameMap.get(reward.reward_type as string);

  if (reward.reward_type === "반응로" || reward.reward_type === "Reactor") {
    return (
      <>
        <HStack justifyContent={"center"}>
          <Image
            src={`/images/${imageName}`}
            alt={reward.reward_type as string}
            width="60px"
            height="60px"
          />
          <Divider orientation="vertical" />
          <VStack>
            <Text>{reward.reactor_element_type}</Text>
            <Text>{reward.weapon_rounds_type}</Text>
            <Text>{reward.arche_type}</Text>
          </VStack>
        </HStack>
      </>
    );
  } else {
    return (
      <Box
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        height={"60%"}
      >
        <Image
          src={`/images/${imageName}`}
          alt={reward.reward_type as string}
          width="60px"
          height="60px"
        />
      </Box>
    );
  }
}

const rewardTypeNameMap = new Map<string, string>();
rewardTypeNameMap.set("반응로", "reactor.png");
rewardTypeNameMap.set("메모리", "memory.png");
rewardTypeNameMap.set("보조 전원", "auxiliary power.png");
rewardTypeNameMap.set("센서", "sensor.png");
rewardTypeNameMap.set("처리 장치", "processor.png");
rewardTypeNameMap.set("Reactor", "reactor.png");
rewardTypeNameMap.set("Memory", "memory.png");
rewardTypeNameMap.set("Auxiliary Power", "auxiliary power.png");
rewardTypeNameMap.set("Sensor", "sensor.png");
rewardTypeNameMap.set("Processor", "processor.png");

const RewardRotationPage = () => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;
  const currentRotation = calculateRotationNumber(DateTime.local());
  const translations = translation[locale] || translation.en;

  const data: AllRewardWithLocale = useStaticQuery(graphql`
    query {
      allReward(
        filter: { battle_zone: { elemMatch: { battle_zone_id: { ne: null } } } }
      ) {
        nodes {
          map_id
          map_name
          battle_zone {
            battle_zone_id
            battle_zone_name
            reward {
              rotation
              reward_type
              reactor_element_type
              weapon_rounds_type
              arche_type
            }
          }
          locale
        }
      }
    }
  `);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [selectedMap, setSelectedMap] = useState<string | null>(
    searchParams.get("map") || "all"
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "reward_type"
  );
  const [rewardType, setRewardType] = useState<string>(
    searchParams.get("rewardType") || "all"
  );
  const [reactorElementType, setReactorElementType] = useState<string>(
    searchParams.get("reactorElementType") || "all"
  );
  const [weaponRoundsType, setWeaponRoundsType] = useState<string>(
    searchParams.get("weaponRoundsType") || "all"
  );
  const [archeType, setArcheType] = useState<string>(
    searchParams.get("archeType") || "all"
  );
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [offset, setOffset] = useState<number>(
    Number(searchParams.get("offset")) || 0
  );
  const rotation =
    (currentRotation + offset) % totalRotations || totalRotations;
  const newDuration = calculateDurationBasedOnOffset(offset);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedMap) params.set("map", selectedMap);
    if (sortBy) params.set("sortBy", sortBy);
    if (rewardType) params.set("rewardType", rewardType);
    if (reactorElementType)
      params.set("reactorElementType", reactorElementType);
    if (weaponRoundsType) params.set("weaponRoundsType", weaponRoundsType);
    if (archeType) params.set("archeType", archeType);
    params.set("offset", String(offset));

    const queryString = params.toString();
    navigate(`?${queryString}`, { replace: true });
  }, [
    selectedMap,
    rewardType,
    reactorElementType,
    weaponRoundsType,
    archeType,
    offset,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = DateTime.local();
      const nextTuesday = calculateNextTuesday4PM();
      const diff = Interval.fromDateTimes(now, nextTuesday);

      const duration = diff.toDuration(["days", "hours"]);

      if (locale === "ko") {
        setTimeRemaining(duration.toFormat("d일 hh시간"));
      } else {
        const days = Math.floor(duration.days);
        const hours = Math.floor(duration.hours);
        setTimeRemaining(`${days}d ${hours}h`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleArrowClick = (isRight: boolean) => {
    if (isRight) {
      if (offset < 19) {
        setOffset(offset + 1);
      }
    } else {
      if (offset > 0) {
        setOffset(offset - 1);
      }
    }
  };

  const allRewardFilteredLocale = data.allReward.nodes.filter(
    (map) => map.locale === locale
  );

  let filteredRewards = allRewardFilteredLocale
    .filter((map) =>
      selectedMap !== "all" ? map.map_name === selectedMap : true
    )
    .flatMap((map) =>
      map.battle_zone.flatMap((zone) =>
        zone.reward
          .filter(
            (reward) =>
              reward.rotation === rotation &&
              (rewardType !== "all"
                ? reward.reward_type === rewardType
                : true) &&
              (reactorElementType !== "all"
                ? reward.reactor_element_type === reactorElementType
                : true) &&
              (weaponRoundsType !== "all"
                ? reward.weapon_rounds_type === weaponRoundsType
                : true) &&
              (archeType !== "all" ? reward.arche_type === archeType : true)
          )
          .map((reward) => ({
            ...reward,
            map_name: map.map_name,
            battle_zone_name: zone.battle_zone_name,
          }))
      )
    );

  filteredRewards = filteredRewards.sort((a: any, b: any) => {
    if (sortBy === "reward_type") {
      return a.reward_type.localeCompare(b.reward_type);
    } else if (sortBy === "battle_zone_name") {
      return a.battle_zone_name.localeCompare(b.battle_zone_name);
    }
    return 0;
  });

  return (
    <Layout>
      <SEO
        title={translations.seo_title}
        description={translations.seo_description}
        pathname={'/reward_rotation'}
      />
      <Box display="flex" overflow="hidden" width="70%">
        <VStack
          align="start"
          spacing={4}
          bg="gray.50"
          p={4}
          borderRadius="md"
          flex="0 0 250px"
          overflowY="auto"
          height="fit-content"
        >
          <Heading size="md">Maps</Heading>
          <Text
            key={"all"}
            onClick={() => setSelectedMap("all")}
            cursor="pointer"
            bg={selectedMap === "all" ? "blue.200" : "transparent"}
            p={2}
            borderRadius="md"
          >
            {translations.all}
          </Text>
          {allRewardFilteredLocale.map((map: any) => (
            <Text
              key={map.map_id}
              onClick={() => setSelectedMap(map.map_name)}
              cursor="pointer"
              bg={selectedMap === map.map_name ? "blue.200" : "transparent"}
              p={2}
              borderRadius="md"
            >
              {map.map_name}
            </Text>
          ))}
        </VStack>

        <VStack
          align="start"
          spacing={4}
          flex="1"
          overflowY="auto"
          p={4}
          textColor="white"
        >
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              {translations.time_remaining_message}: {timeRemaining}
            </Text>
            <Text>
              <ArrowLeftIcon
                cursor="pointer"
                onClick={() => handleArrowClick(false)}
                mr={2}
                ml={2}
              />
              {`${translations.rotation}: ${rotation}`}
              <ArrowRightIcon
                cursor="pointer"
                onClick={() => handleArrowClick(true)}
                mr={2}
                ml={2}
              />

              <Button onClick={() => setOffset(0)} size="sm">
                {translations.current_rotation}
              </Button>
            </Text>
            <Text>{`${newDuration[0].toLocaleString()} ~ ${newDuration[1].toLocaleString()}`}</Text>
          </Box>
          <HStack spacing={4} width="100%">
            <Select
              defaultValue={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              textColor="white"
            >
              <option value="reward_type">{translations.sort_by_type}</option>
              <option value="battle_zone_name">
                {translations.sort_by_battle_zone}
              </option>
            </Select>

            <Select
              defaultValue={weaponRoundsType}
              onChange={(e) => setWeaponRoundsType(e.target.value)}
              textColor="white"
            >
              <option value="all">{translations.all}</option>
              <option value={translations.general_rounds}>
                {translations.general_rounds}
              </option>
              <option value={translations.special_rounds}>
                {translations.special_rounds}
              </option>
              <option value={translations.impact_rounds}>
                {translations.impact_rounds}
              </option>
              <option value={translations.high_power_rounds}>
                {translations.high_power_rounds}
              </option>
            </Select>

            <Select
              defaultValue={reactorElementType}
              onChange={(e) => setReactorElementType(e.target.value)}
              textColor="white"
            >
              <option value="all">{translations.all}</option>
              <option value={translations.non_attribute}>
                {translations.non_attribute}
              </option>
              <option value={translations.chill}>{translations.chill}</option>
              <option value={translations.toxic}>{translations.toxic}</option>
              <option value={translations.fire}>{translations.fire}</option>
              <option value={translations.electric}>
                {translations.electric}
              </option>
            </Select>

            <Select
              defaultValue={archeType}
              onChange={(e) => setArcheType(e.target.value)}
              textColor="white"
            >
              <option value="all">{translations.all}</option>
              <option value={translations.fusion}>{translations.fusion}</option>
              <option value={translations.singular}>
                {translations.singular}
              </option>
              <option value={translations.dimension}>
                {translations.dimension}
              </option>
              <option value={translations.tech}>{translations.tech}</option>
            </Select>

            <Select
              defaultValue={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              textColor="white"
            >
              <option value="all">{translations.all}</option>
              <option value={translations.auxiliary_power}>
                {translations.auxiliary_power}
              </option>
              <option value={translations.sensor}>{translations.sensor}</option>
              <option value={translations.memory}>{translations.memory}</option>
              <option value={translations.processor}>
                {translations.processor}
              </option>
              <option value={translations.reactor}>
                {translations.reactor}
              </option>
            </Select>
          </HStack>

          <SimpleGrid columns={3} spacing={4} width="100%">
            {filteredRewards.length === 0 ? (
              <Text>No rewards found for this rotation.</Text>
            ) : (
              filteredRewards.map((reward, index: number) => (
                <Box
                  key={index}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Box>
                    <Heading size="lg">{reward.map_name}</Heading>
                    <Heading size="md">{reward.battle_zone_name}</Heading>
                  </Box>
                  <Divider />
                  {getRewardInfoByType(reward)}
                </Box>
              ))
            )}
          </SimpleGrid>
        </VStack>
      </Box>
    </Layout>
  );
};

export default RewardRotationPage;

const translation: {
  [key: string]: {
    seo_title: string;
    seo_description: string;
    all: string;
    reactor: string;
    memory: string;
    auxiliary_power: string;
    sensor: string;
    processor: string;
    time_remaining_message: string;
    rotation: string;
    current_rotation: string;
    sort_by_type: string;
    sort_by_battle_zone: string;
    non_attribute: string;
    chill: string;
    toxic: string;
    fire: string;
    electric: string;
    fusion: string;
    singular: string;
    dimension: string;
    tech: string;
    general_rounds: string;
    impact_rounds: string;
    special_rounds: string;
    high_power_rounds: string;
  };
} = {
  ko: {
    seo_title: "난이도 보상 로테이션",
    seo_description: "퍼스트 디센던트 현재와 그 이후의 주간 난이도 보상 로테이션을 확인하세요.",
    all: "전체",
    reactor: "반응로",
    memory: "메모리",
    auxiliary_power: "보조전원",
    sensor: "센서",
    processor: "처리 장치",
    time_remaining_message: "보상 변경까지 남은 시간",
    rotation: "로테이션",
    current_rotation: "현재 로테이션",
    sort_by_type: "정렬기준: 유형",
    sort_by_battle_zone: "정렬기준: 전장",
    non_attribute: "무 속성",
    chill: "냉기",
    toxic: "독",
    fire: "화염",
    electric: "전기",
    fusion: "융합",
    singular: "특이",
    dimension: "차원",
    tech: "공학",
    general_rounds: "일반탄",
    impact_rounds: "충격탄",
    special_rounds: "특수탄",
    high_power_rounds: "고위력탄",
  },
  en: {
    seo_title: "Difficulty Level Rewards",
    seo_description: "TFD Check out the current and subsequent weekly difficulty reward rotation.",
    all: "all",
    reactor: "Reactor",
    memory: "Memory",
    auxiliary_power: "Auxiliary Power",
    sensor: "Sensor",
    processor: "processor",
    time_remaining_message: "Time remaining until next reward rotation",
    rotation: "Rotation",
    current_rotation: "Current Rotation",
    sort_by_type: "Sort by: Type",
    sort_by_battle_zone: "Sort by: Battle Zone",
    non_attribute: "Non-Attribute",
    chill: "Chill",
    toxic: "Toxic",
    fire: "Fire",
    electric: "Electric",
    fusion: "Fusion",
    singular: "Singular",
    dimension: "Dimension",
    tech: "Tech",
    general_rounds: "General Rounds",
    impact_rounds: "Impact Rounds",
    special_rounds: "Special Rounds",
    high_power_rounds: "High-Power Rounds",
  },
};
