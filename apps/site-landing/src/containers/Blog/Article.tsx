import React, { useEffect } from "react";
import styles from "./styles.module.less";
import { PrismicText, PrismicRichText } from '@prismicio/react';
import { useSelector } from "react-redux";
import { Prismic } from "components/Prismic";
import { Header, Icon } from "semantic-ui-react";
import { selectLocale } from "@thecointech/shared/containers/LanguageProvider/selector";
import { useParams, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { defineMessages, FormattedMessage } from "react-intl";
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';

const translations = defineMessages({
  backLink: {
    defaultMessage: 'Go back',
    description: 'site.blog.backLink: Link to go back from article'
  }
});

export const Article = () => {
  const prismic = Prismic.useData();
  const actions = Prismic.useApi();
  const { locale } = useSelector(selectLocale);
  const navigate = useNavigate();
  const { articleId } = useParams<{articleId: string}>();

  const articles = prismic[locale].articles;
  const articleData = articleId ? articles.get(articleId) : undefined;

  // If we haven't fetched this article yet, do so now.
  useEffect(() => {
    if (articleId && !articleData) {
      actions.fetchDoc(articleId, locale);
    }
  }, [articleId, locale]);

  // Display
  return articleData
    ? <>
        <div className={styles.containerArticle} key={articleData.id}>
          <div className={` ${styles.backLink} x6spaceBefore`}><a onClick={() => navigate(-1)}><Icon name="arrow left" /><FormattedMessage {...translations.backLink} /></a></div>
          { articleData.data.image_before_title.url ? <img src={articleData.data.image_before_title.url} alt={articleData.data.image_before_title.alt} /> : undefined }
          <Header as={"h2"} className="x6spaceBefore">
            <PrismicText field={articleData.data.title} />
          </Header>
          <p>{DateTime.fromFormat(articleData.data.publication_date, "yyyy-mm-dd", {}).setLocale(locale).toLocaleString(DateTime.DATE_HUGE)}</p>
          <PrismicRichText field={articleData.data.content} />
        </div>
      </>
    : <NotFoundPage />
}
