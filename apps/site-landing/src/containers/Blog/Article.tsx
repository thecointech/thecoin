import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Prismic } from "components/Prismic";
import { Icon } from "semantic-ui-react";
import { selectLocale } from "@thecointech/redux-intl";
import { useParams, useNavigate } from "react-router";
import { defineMessages, FormattedMessage } from "react-intl";
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Article as ArticleSlice, BlogContainer, getRecommendedArticles, Related } from '@thecointech/site-prismic/components';
import { Link } from 'react-router';

const translations = defineMessages({
  backLink: {
    defaultMessage: 'Go back',
    description: 'site.blog.backLink: Link to go back from article'
  },
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
  const navigate = useNavigate();
  const { articleId: routerArticleId } = useParams<{articleId: string}>();

  // Use prop articleId if provided, otherwise fall back to router param
  const articleId = propArticleId ?? routerArticleId;

  const articles = prismic[locale].articles;
  const articleData = articleId ? articles.get(articleId) : undefined;

  // Get all articles as array for recommendations
  const allArticles = Array.from(articles.values());

  // If we haven't fetched this article yet, do so now.
  useEffect(() => {
    if (articleId && !articleData && !isPreview) {
      actions.fetchDoc(articleId, locale);
    }
  }, [articleId, articleData, locale, isPreview]);

  // Once we have the article, load the rest so we can have "Related Articles"
  useEffect(() => {
    if (articleId && articleData && !prismic[locale].fullyLoaded) {
      actions.fetchAllDocs(locale);
    }
  }, [articleId, articleData, prismic, locale]);

  const handleBack = () => {
    if (isPreview) {
      navigate('/blog');
    } else {
      navigate(-1);
    }
  };

  // Get recommended articles using shared logic
  const recommendedArticles = articleData
    ? getRecommendedArticles(articleData, allArticles, 3)
    : [];

  // Custom Link component for react-router
  const RouterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link to={href}>{children}</Link>
  );

  console.log(recommendedArticles.length)
  // Display
  return articleData
    ? <>
        <BlogContainer backLink={
          <a onClick={handleBack}>
            <Icon name="arrow left" />
            <FormattedMessage {...translations.backLink} />
          </a>
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
