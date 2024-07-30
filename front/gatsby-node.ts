import axios from "axios";
import fs from "fs";
import path from "path";
import { GatsbyNode } from "gatsby";
import { Descendant, MapData, Module } from "./src/types";

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
    const rewardResponse = await axios.get<MapData[]>(rewardUrl);
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

interface ModuleIds {
  allModule: {
    nodes: Module[];
  };
}

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions;

  const { data } = await graphql(`
    {
      allModule {
        nodes {
          module_id
        }
      }
    }
  `);

  (data as ModuleIds).allModule.nodes.forEach((node: { module_id: any }) => {
    createPage({
      path: `/module/${node.module_id}`,
      component: path.resolve("./src/templates/module_detail.tsx"),
      context: {
        module_id: node.module_id,
      },
    });
  });
};
