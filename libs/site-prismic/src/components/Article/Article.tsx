import React from "react";
import styles from "./Article.module.css";
import { SliceZone } from "@prismicio/react";
import { DateTime } from "luxon";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { RichText } from "../RichText";

export type ArticleProps = {
  document: Content.ArticleDocument;
  locale?: string;
}
export const Article = ({document, locale="en"}: ArticleProps) => {
  const date = document.data.publication_date
    ? DateTime.fromSQL(document.data.publication_date)
      .setLocale(locale)
      .toLocaleString(DateTime.DATE_HUGE)
    : "";

  return (
    <div className={styles.containerArticle}>
      {document.data.image_before_title?.url
        ? <img src={document.data.image_before_title.url} alt={document.data.image_before_title.alt ?? ""} />
        : undefined
      }
      <RichText field={document.data.title} />
      <p>{date}</p>
      <RichText field={document.data.content} />
      <SliceZone slices={document.data.slices} components={components} />
    </div>
  )
}
