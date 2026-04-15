import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Prismic } from "components/Prismic";
import { selectLocale } from "@thecointech/redux-intl";
import { useParams } from "react-router";
import { defineMessages, FormattedMessage } from "react-intl";
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Article as ArticleSlice, BlogContainer, getRecommendedArticles, Related } from '@thecointech/site-prismic/components';
import { Link } from 'react-router';
import { BackButton } from './BackButton';

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
    ? <>
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
    : <NotFoundPage />
}

// Custom Link component for react-router
const RouterLink = ({ articleId, children }: { articleId: string; children: React.ReactNode }) => (
  <Link to={`../${articleId}`}>{children}</Link>
);
