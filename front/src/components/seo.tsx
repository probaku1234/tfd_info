import React, { ReactNode, useContext } from "react";
import { useSiteMetadata } from "../hooks/use-site-metadata";
import LocaleContext from "../context/locale_context";

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  children?: ReactNode;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  pathname,
  children,
}) => {
  const localeContext = useContext(LocaleContext);
  const { locale } = localeContext!;

  const {
    title: defaultTitle,
    descriptions,
    image,
    siteUrl,
    keywords,
  } = useSiteMetadata();

  const seo = {
    title: title || defaultTitle,
    description: description || descriptions[locale],
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || ``}`,
    keywords,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta name="url" content={seo.url} />
      <meta name="keywords" content={seo.keywords} />

      {/*  */}
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={"/images/main2.png"} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={"/images/main2.png"} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      <link rel="canonical" href={seo.url} />

      {children}
    </>
  );
};
