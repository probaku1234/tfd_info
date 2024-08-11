import axios from "axios";
import fs from "fs";
import path from "path";
import { GatsbyNode } from "gatsby";
import {
  Descendant,
  MapData,
  Module,
  Reactor,
  ExternalComponent,
  Weapon,
  Stat,
} from "./src/types";

// Define the Gatsby sourceNodes API
export const sourceNodes: GatsbyNode["sourceNodes"] = async ({ actions }) => {
  const { createNode } = actions;

  // Define URLs for the JSON data
  const urls = {
    ko: {
      module: "https://open.api.nexon.com/static/tfd/meta/ko/module.json",
      descendant:
        "https://open.api.nexon.com/static/tfd/meta/ko/descendant.json",
      reward: "https://open.api.nexon.com/static/tfd/meta/ko/reward.json",
      reactor: "https://open.api.nexon.com/static/tfd/meta/ko/reactor.json",
      external_component:
        "https://open.api.nexon.com/static/tfd/meta/ko/external-component.json",
      weapon: "https://open.api.nexon.com/static/tfd/meta/ko/weapon.json",
      stat: "https://open.api.nexon.com/static/tfd/meta/ko/stat.json",
    },
    en: {
      module: "https://open.api.nexon.com/static/tfd/meta/en/module.json",
      descendant:
        "https://open.api.nexon.com/static/tfd/meta/en/descendant.json",
      reward: "https://open.api.nexon.com/static/tfd/meta/en/reward.json",
      reactor: "https://open.api.nexon.com/static/tfd/meta/en/reactor.json",
      external_component:
        "https://open.api.nexon.com/static/tfd/meta/en/external-component.json",
      weapon: "https://open.api.nexon.com/static/tfd/meta/en/weapon.json",
      stat: "https://open.api.nexon.com/static/tfd/meta/en/stat.json",
    },
  };

  const dataDir = path.join(__dirname, "src/data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const fetchDataAndCreateNodes = async (locale: "ko" | "en") => {
    try {
      // Fetch and process module data
      const moduleResponse = await axios.get<Module[]>(urls[locale].module);
      const modules = moduleResponse.data;

      fs.writeFileSync(
        path.join(dataDir, `modules_${locale}.json`),
        JSON.stringify(modules)
      );

      // Create nodes for modules
      modules.forEach((module) => {
        createNode({
          ...module,
          locale,
          id: `${locale}_${module.module_id}`, // use locale and module_id as the node ID
          internal: {
            type: "Module",
            contentDigest: JSON.stringify(module),
          },
        });
      });

      // Fetch and process descendant data
      const descendantResponse = await axios.get<Descendant[]>(
        urls[locale].descendant
      );
      const descendants = descendantResponse.data;

      // Write descendant data to a file (optional)
      fs.writeFileSync(
        path.join(dataDir, `descendants_${locale}.json`),
        JSON.stringify(descendants)
      );

      // Create nodes for descendants
      descendants.forEach((descendant) => {
        createNode({
          ...descendant,
          locale,
          id: `${locale}_${descendant.descendant_id}`, // use locale and descendant_id as the node ID
          internal: {
            type: "Descendant",
            contentDigest: JSON.stringify(descendant),
          },
        });
      });

      // Fetch and process reward data
      const rewardResponse = await axios.get<MapData[]>(urls[locale].reward);
      const rewards = rewardResponse.data;

      // Write reward data to a file (optional)
      fs.writeFileSync(
        path.join(dataDir, `rewards_${locale}.json`),
        JSON.stringify(rewards)
      );

      // Create nodes for rewards
      rewards.forEach((map) => {
        createNode({
          ...map,
          locale,
          id: `${locale}_${map.map_id}`, // use locale and map_id as the node ID
          internal: {
            type: "Reward",
            contentDigest: JSON.stringify(map),
          },
        });
      });

      // Fetch and process reactor data
      const reactorResponse = await axios.get<Reactor[]>(urls[locale].reactor);
      const reactors = reactorResponse.data;

      // Write reward data to a file (optional)
      fs.writeFileSync(
        path.join(dataDir, `reactors_${locale}.json`),
        JSON.stringify(reactors)
      );

      reactors.forEach((reactor) => {
        createNode({
          ...reactor,
          locale,
          id: `${locale}_${reactor.reactor_id}`, // use locale and map_id as the node ID
          internal: {
            type: "Reactor",
            contentDigest: JSON.stringify(reactor),
          },
        });
      });

      const externalComponentResponse = await axios.get<ExternalComponent[]>(
        urls[locale].external_component
      );
      const externalComponents = externalComponentResponse.data;

      fs.writeFileSync(
        path.join(dataDir, `externalComponents_${locale}.json`),
        JSON.stringify(externalComponents)
      );

      externalComponents.forEach((externalComponent) => {
        createNode({
          ...externalComponent,
          locale,
          id: `${locale}_${externalComponent.external_component_id}`,
          internal: {
            type: "ExternalComponent",
            contentDigest: JSON.stringify(externalComponent),
          },
        });
      });

      const weaponResponse = await axios.get<Weapon[]>(urls[locale].weapon);
      const weapons = weaponResponse.data;

      fs.writeFileSync(
        path.join(dataDir, `weapons_${locale}.json`),
        JSON.stringify(weapons)
      );

      weapons.forEach((weapon) => {
        createNode({
          ...weapon,
          locale,
          id: `${locale}_${weapon.weapon_id}`,
          internal: {
            type: "Weapon",
            contentDigest: JSON.stringify(weapon),
          },
        });
      });

      const statResponse = await axios.get<Stat[]>(urls[locale].stat);
      const stats = statResponse.data;

      fs.writeFileSync(
        path.join(dataDir, `stats_${locale}.json`),
        JSON.stringify(stats)
      );

      stats.forEach((stat) => {
        createNode({
          ...stat,
          locale,
          id: `${locale}_${stat.stat_id}`,
          internal: {
            type: "Stat",
            contentDigest: JSON.stringify(stat),
          },
        });
      });
    } catch (error) {
      console.error(`Error fetching ${locale} data:`, error);
    }
  };

  // Fetch data and create nodes for both locales
  await Promise.all([
    fetchDataAndCreateNodes("ko"),
    fetchDataAndCreateNodes("en"),
  ]);
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

  (data as ModuleIds).allModule.nodes.forEach((node: { module_id: string }) => {
    createPage({
      path: `/module/${node.module_id}`,
      component: path.resolve("./src/templates/module_detail.tsx"),
      context: {
        module_id: node.module_id,
      },
    });
  });
};
