import axios from "axios";
import fs from "fs";
import path from "path";
import { GatsbyNode } from "gatsby";

// Define TypeScript interfaces for the data
interface StatDetail {
  stat_type: string;
  stat_value: number;
}

interface DescendantStat {
  level: number;
  stat_detail: StatDetail[];
}

interface DescendantSkill {
  skill_type: string;
  skill_name: string;
  element_type: string;
  arche_type: string;
  skill_image_url: string;
  skill_description: string;
}

interface Descendant {
  descendant_id: string;
  descendant_name: string;
  descendant_image_url: string;
  descendant_stat: DescendantStat[];
  descendant_skill: DescendantSkill[];
}

interface ModuleStat {
  level: number;
  module_capacity: number;
  value: string;
}

interface Module {
  module_name: string;
  module_id: string;
  image_url: string;
  module_type: string | null;
  module_tier: string;
  module_socket_type: string;
  module_class: string;
  module_stat: ModuleStat[];
}

interface Reward {
  rotation: number;
  reward_type: string;
  reactor_element_type: string;
  weapon_rounds_type: string;
  arche_type: string;
}

interface BattleZone {
  battle_zone_id: string;
  battle_zone_name: string;
  reward: Reward[];
}

interface Map {
  map_id: string;
  map_name: string;
  battle_zone: BattleZone[];
}

// Define the Gatsby sourceNodes API
export const sourceNodes: GatsbyNode["sourceNodes"] = async ({ actions }) => {
  const { createNode } = actions;

  // Define URLs for the JSON data
  const moduleUrl = "https://open.api.nexon.com/static/tfd/meta/ko/module.json";
  const descendantUrl =
    "https://open.api.nexon.com/static/tfd/meta/ko/descendant.json";
  const rewardUrl = "https://open.api.nexon.com/static/tfd/meta/ko/reward.json";

  try {
    // Fetch and process module data
    const moduleResponse = await axios.get<Module[]>(moduleUrl);
    const modules = moduleResponse.data;

    // Write module data to a file (optional)
    const dataDir = path.join(__dirname, "src/data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
      path.join(dataDir, "modules.json"),
      JSON.stringify(modules)
    );

    // Create nodes for modules
    modules.forEach((module) => {
      createNode({
        ...module,
        id: module.module_id, // use module_id as the node ID
        internal: {
          type: "Module",
          contentDigest: JSON.stringify(module),
        },
      });
    });

    // Fetch and process descendant data
    const descendantResponse = await axios.get<Descendant[]>(descendantUrl);
    const descendants = descendantResponse.data;

    // Write descendant data to a file (optional)
    fs.writeFileSync(
      path.join(dataDir, "descendants.json"),
      JSON.stringify(descendants)
    );

    // Create nodes for descendants
    descendants.forEach((descendant) => {
      createNode({
        ...descendant,
        id: descendant.descendant_id, // use descendant_id as the node ID
        internal: {
          type: "Descendant",
          contentDigest: JSON.stringify(descendant),
        },
      });
    });

    // Fetch and process reward data
    const rewardResponse = await axios.get<Map[]>(rewardUrl);
    const rewards = rewardResponse.data;

    // Write reward data to a file (optional)
    fs.writeFileSync(
      path.join(dataDir, "rewards.json"),
      JSON.stringify(rewards)
    );

    // Create nodes for rewards
    rewards.forEach((map) => {
      createNode({
        ...map,
        id: map.map_id, // Unique ID for each reward
        internal: {
          type: "Reward",
          contentDigest: JSON.stringify(map),
        },
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
