import type { GatsbyConfig } from "gatsby";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: __dirname + `/.env.${process.env.NODE_ENV}` });

const gatsbyRequiredRules = path.join(
  process.cwd(),
  "node_modules",
  "gatsby",
  "dist",
  "utils",
  "eslint-rules"
);

const config: GatsbyConfig = {
  siteMetadata: {
    title: "TFD Info",
    descriptions: {
      ko: "퍼스트 디센던트와 관련된 다양한 정보를 제공합니다. 유저 계승자, 다음 보상 로테이션, 모듈등 여러 정보들을 확인해 보세요!",
      en: "Provides various information related to The First Descendant. Check user descendants, next reward rotation, modules, and more!",
    },
    image: "/favicon-32x32.png",
    siteUrl: `https://tfd-info.vercel.app/`,
    keywords: [
      "퍼디",
      "더 퍼스트 디센던트",
      "퍼스트 디센던트",
      "tfd",
      "퍼디 유저 정보 검색",
      "퍼스트 디센던트 유저 정보 검색",
      "퍼스트 디센던트 유저 계승자 검색",
      "퍼스트 디센던트 유저 계승자",
      "퍼디 주간 보상 정보",
      "퍼디 난이도 보상",
      "퍼디 난이도 보상 로테이션",
      "퍼디 난이도 보상 로테이션 확인",
      "퍼스트 디센던트 난이도 보상",
      "퍼스트 디센던트 난이도 보상 로테이션",
      "퍼스트 디센던트 난이도 보상 로테이션 확인",
      "퍼디 모듈 정보",
      "퍼스트 디센던트 모듈 정보",
      "TFD",
      "The First Descendant",
      "First Descendant",
      "TFD user info search",
      "First Descendant user info search",
      "First Descendant user descendant search",
      "First Descendant user descendant",
      "TFD weekly reward info",
      "TFD difficulty reward",
      "TFD difficulty reward rotation",
      "TFD difficulty reward rotation check",
      "First Descendant difficulty reward",
      "First Descendant difficulty reward rotation",
      "First Descendant difficulty reward rotation check",
      "TFD module info",
      "First Descendant module info",
    ],
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/favicon-32x32.png",
      },
    },
    {
      resolve: "@chakra-ui/gatsby-plugin",
      options: {
        /**
         * @property {boolean} [resetCSS=true]
         * if false, this plugin will not use `<CSSReset />
         */
        resetCSS: true,
        /**
         * @property {number} [portalZIndex=undefined]
         * The z-index to apply to all portal nodes. This is useful
         * if your app uses a lot z-index to position elements.
         */
        portalZIndex: undefined,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: path.join(__dirname, "data"),
      },
    },
    `gatsby-transformer-json`,
    "gatsby-plugin-sitemap",
    'gatsby-plugin-dts-css-modules',
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
};

export default config;
