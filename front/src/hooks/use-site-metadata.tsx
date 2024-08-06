import { graphql, useStaticQuery } from "gatsby";

export const useSiteMetadata = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          descriptions {
            ko
            en
          }
          image
          siteUrl
          keywords
        }
      }
    }
  `);

  return data.site.siteMetadata;
};
