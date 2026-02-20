import React from "react"
import type { ArticleDocument } from "@thecointech/site-prismic/types";
import styles from "./Related.module.css";
import { asText } from "@prismicio/client";
import { Header } from "semantic-ui-react";

type Props = {
  relatedArticles: ArticleDocument[]
  title: React.ReactNode,
  LinkComponent: React.ComponentType<{ href: string; children: React.ReactNode }>
}

export function Related({ title, relatedArticles, LinkComponent }: Props) {
  if (relatedArticles.length === 0) {
    return null;
  }
  return (
    <section className={styles.related}>
      <Header size="small">
        {title}
      </Header>
      <div className={styles.relatedGrid}>
        <ul>
          {relatedArticles.map((article) => (
            <li key={article.id}>
              <LinkComponent href={`/article/${article.uid}`}>
               {asText(article.data.title)}
              </LinkComponent>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
