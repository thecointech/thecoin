
import React from "react";
import { Header } from "semantic-ui-react";
import styles from "./Article.module.css";
import { PrismicText, PrismicRichText } from "@prismicio/react";
import { DateTime } from "luxon";
// import { FormattedMessage } from "react-intl";
// import { Icon } from "semantic-ui-react";
import { Content } from "@prismicio/client";

export type ArticleProps = {
  document: Content.ArticleDocument;
}
export const Article = ({document}: ArticleProps) => {
  const locale = "en"; // TODO
  console.log(document.data.publication_date)
  const date = DateTime.fromSQL(document.data.publication_date || "")
    .setLocale(locale)
    .toLocaleString(DateTime.DATE_HUGE);

  return (
    <div className={styles.containerArticle} key={document.id}>
    {/* <div className={` ${styles.backLink} x6spaceBefore`}>
      <a onClick={() => navigate(-1)}>
        <Icon name="arrow left" />
        <FormattedMessage {...translations.backLink} />
      </a>
    </div> */}
    { document.data.image_before_title?.url
      ? <img src={document.data.image_before_title.url} alt={document.data.image_before_title.alt ?? ""} />
      : undefined
    }
    <Header as={"h2"}>
      <PrismicText field={document.data.title} />
    </Header>
    <p>{date}</p>
    <PrismicRichText field={document.data.content} />
  </div>
  )
}
