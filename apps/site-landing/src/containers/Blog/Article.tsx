import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Prismic } from "components/Prismic";
import { selectLocale } from "@thecointech/redux-intl";
import { useParams } from "react-router";
import { defineMessages, FormattedMessage } from "react-intl";
import { Helmet } from 'react-helmet-async';
import { asText } from '@prismicio/client';
import { Article as ArticleSlice, BlogContainer, getRecommendedArticles, Related } from '@thecointech/site-prismic/components';
import { Link } from 'react-router';
import { BackButton } from './BackButton';
import { ArticleNotFoundPage } from "./ArticleNotFoundPage";

const translations = defineMessages({
  relatedTitle: {
    defaultMessage: 'Related Articles',
    description: 'site.blog.relatedTitle: Title for recommended articles links section'
  }
});

interface ArticleProps {
  articleId?: string;
  isPreview?: boolean;
}

export const Article = ({ articleId: propArticleId, isPreview = false }: ArticleProps = {}) => {
  const prismic = Prismic.useData();
  const actions = Prismic.useApi();
  const { locale } = useSelector(selectLocale);
  const { articleId: routerArticleId } = useParams<{articleId: string}>();

  // Use prop articleId if provided, otherwise fall back to router param
  const articleId = propArticleId ?? routerArticleId;

  const articles = prismic[locale].articles;
  const articleData = articleId ? articles.get(articleId) : undefined;

  // Get all articles as array for recommendations
  const allArticles = useMemo(() => Array.from(articles.values()), [articles]);

  // If we haven't fetched this article yet, do so now.
  useEffect(() => {
    if (articleId && !articleData && !isPreview) {
      actions.fetchDoc(articleId, locale);
    }
  }, [articleId, articleData, locale, isPreview]);

  // Once we have the article, load the rest so we can have "Related Articles"
  const fullyLoaded = prismic[locale].fullyLoaded;
  useEffect(() => {
    if (articleId && articleData && !fullyLoaded) {
      actions.fetchAllDocs(locale);
    }
  }, [articleId, articleData, fullyLoaded, locale]);

  // Get recommended articles using shared logic
  const recommendedArticles = useMemo(() => {
    return articleData
      ? getRecommendedArticles(articleData, allArticles, 3)
      : [];
  }, [articleData, allArticles, locale]);


  // Display
  return articleData
    ? <ArticleContent key={articleId} articleData={articleData} locale={locale} isPreview={isPreview} recommendedArticles={recommendedArticles} />
    : <ArticleNotFoundPage isLoading={prismic.loading > 0} />
}

// Separate component that gets remounted when articleId changes
const ArticleContent = ({ articleData, locale, isPreview, recommendedArticles }: {
  articleData: any;
  locale: string;
  isPreview: boolean;
  recommendedArticles: any[];
}) => {
  // Scroll to top when this component mounts (overrides ScrollRestoration)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ogTitle = articleData?.data.meta_title ?? asText(articleData?.data.title) ?? '';
  const ogDescription = articleData?.data.meta_description ?? asText(articleData?.data.short_content) ?? '';
  const ogImage = articleData?.data.meta_image?.url || articleData?.data.thumbnail?.url || '';

  return (
    <>
      <Helmet>
        <title>{ogTitle} | TheCoin</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>
      <BlogContainer backLink={
        <BackButton isPreview={isPreview} />
      }>
        <ArticleSlice document={articleData} locale={locale}/>
        <Related
          relatedArticles={recommendedArticles}
          title={<FormattedMessage {...translations.relatedTitle} />}
          LinkComponent={RouterLink}
        />
      </BlogContainer>
    </>
  );
}

// Custom Link component for react-router
const RouterLink = ({ articleId, children }: { articleId: string; children: React.ReactNode }) => (
  <Link to={`../${articleId}`}>{children}</Link>
);
