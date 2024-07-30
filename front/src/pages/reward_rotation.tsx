import React, { useState, useEffect } from "react";
import { graphql, useStaticQuery, navigate } from "gatsby";
import { DateTime, Interval } from "ts-luxon";
import Layout from "../components/layout";
import {
  Box,
  Grid,
  Heading,
  Select,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { useLocation } from "@reach/router";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { SEO } from "../components/seo";
import "./reward_rotation.css";

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

const RewardRotationPage = () => {
  const currentRotation = calculateRotationNumber(DateTime.local());

  const data = useStaticQuery(graphql`
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

      setTimeRemaining(
        diff.toDuration(["days", "hours"]).toFormat("d일 hh시간")
      );
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

  let filteredRewards = data.allReward.nodes
    .filter((map: any) =>
      selectedMap !== "all" ? map.map_name === selectedMap : true
    )
    .flatMap((map: any) =>
      map.battle_zone.flatMap((zone: any) =>
        zone.reward
          .filter(
            (reward: any) =>
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
          .map((reward: any) => ({
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
            전체
          </Text>
          {data.allReward.nodes.map((map: any) => (
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
              보상 변경까지 남은 시간: {timeRemaining}
            </Text>
            <Text>
              <ArrowLeftIcon
                cursor="pointer"
                onClick={() => handleArrowClick(false)}
                mr={2}
                ml={2}
              />
              {`로테이션: ${rotation}`}
              <ArrowRightIcon
                cursor="pointer"
                onClick={() => handleArrowClick(true)}
                mr={2}
                ml={2}
              />

              <Button onClick={() => setOffset(0)} size="sm">
                현재 로테이션
              </Button>
            </Text>
            <Text>{`${newDuration[0].toLocaleString()} ~ ${newDuration[1].toLocaleString()}`}</Text>
          </Box>
          <HStack spacing={4} width="100%">
            <Select
              defaultValue={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              textColor="black"
            >
              <option value="reward_type">정렬기준: 유형</option>
              <option value="battle_zone_name">정렬기준: 전장</option>
            </Select>

            <Select
              defaultValue={weaponRoundsType}
              onChange={(e) => setWeaponRoundsType(e.target.value)}
              textColor="black"
            >
              <option value="all">전체</option>
              <option value="일반탄">일반탄</option>
              <option value="특수탄">특수탄</option>
              <option value="충격탄">충격탄</option>
              <option value="고위력탄">고위력탄</option>
            </Select>

            <Select
              defaultValue={reactorElementType}
              onChange={(e) => setReactorElementType(e.target.value)}
              textColor="black"
            >
              <option value="all">전체</option>
              <option value="무 속성">무 속성</option>
              <option value="냉기">냉기</option>
              <option value="독">독</option>
              <option value="화염">화염</option>
              <option value="전기">전기</option>
            </Select>

            <Select
              defaultValue={archeType}
              onChange={(e) => setArcheType(e.target.value)}
              textColor="black"
            >
              <option value="all">전체</option>
              <option value="융합">융합</option>
              <option value="특이">특이</option>
              <option value="차원">차원</option>
              <option value="공학">공학</option>
            </Select>

            <Select
              defaultValue={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              textColor="black"
            >
              <option value="all">전체</option>
              <option value="보조전원">보조전원</option>
              <option value="센서">센서</option>
              <option value="메모리">메모리</option>
              <option value="처리장치">처리장치</option>
              <option value="반응로">반응로</option>
            </Select>
          </HStack>

          <SimpleGrid columns={3} spacing={4} width="100%">
            {filteredRewards.length === 0 ? (
              <Text>No rewards found for this rotation.</Text>
            ) : (
              filteredRewards.map((reward: any, index: number) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text>{reward.map_name}</Text>
                  <Text>{reward.battle_zone_name}</Text>
                  <Text>{reward.reward_type}</Text>
                  <Text>{reward.reactor_element_type}</Text>
                  <Text>{reward.weapon_rounds_type}</Text>
                  <Text>{reward.arche_type}</Text>
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

export const Head = () => <SEO title="난이도 보상 로테이션" description="주간 난이도 보상 로테이션을 확인할 수 있습니다."/>;
