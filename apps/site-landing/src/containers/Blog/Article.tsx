import React, { useEffect } from "react";
import styles from "./styles.module.less";
import { useSelector } from "react-redux";
import { Prismic } from "components/Prismic";
import { Icon } from "semantic-ui-react";
import { selectLocale } from "@thecointech/redux-intl";
import { useParams, useNavigate } from "react-router";
import { defineMessages, FormattedMessage } from "react-intl";
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Article as ArticleSlice } from '@thecointech/site-prismic/components';

const translations = defineMessages({
  backLink: {
    defaultMessage: 'Go back',
    description: 'site.blog.backLink: Link to go back from article'
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

  // If we haven't fetched this article yet, do so now.
  useEffect(() => {
    if (articleId && !articleData && !isPreview) {
      actions.fetchDoc(articleId, locale);
    }
  }, [articleId, articleData, isPreview]);

  const handleBack = () => {
    if (isPreview) {
      navigate('/blog');
    } else {
      navigate(-1);
    }
  };

  // Display
  return articleData
    ? <>
        <div className={styles.containerArticle} key={articleData.id}>
          <div className={` ${styles.backLink} x6spaceBefore`}>
            <a onClick={handleBack}>
              <Icon name="arrow left" />
              <FormattedMessage {...translations.backLink} />
            </a>
          </div>
          <ArticleSlice document={articleData} locale={locale}/>
        </div>
      </>
    : <NotFoundPage />
}
