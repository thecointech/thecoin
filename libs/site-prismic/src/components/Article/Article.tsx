
import React from "react";
import { Header } from "semantic-ui-react";
import styles from "./Article.module.css";
import { PrismicText, PrismicRichText } from "@prismicio/react";
import { DateTime } from "luxon";
import { Content } from "@prismicio/client";

export type ArticleProps = {
  document: Content.ArticleDocument;
}
export const Article = ({document}: ArticleProps) => {
  const locale = "en";
  const date = DateTime.fromSQL(document.data.publication_date || "")
    .setLocale(locale)
    .toLocaleString(DateTime.DATE_HUGE);

  return (
    <div className={styles.containerArticle} key={document.id}>
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
