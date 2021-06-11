import React from "react";
import { ArticleItem } from "./ArticleItem";
import { Header } from "semantic-ui-react";
import { ArticleDocument } from "components/Prismic/types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import styles from "./styles.module.less";
import { ArticleMenu } from "./ArticleMenu";
import { Dictionary } from "lodash";
import { Decoration } from "components/Decoration";

type Props = {
  title?: string,
  articles: ArticleDocument[],
  menu: Dictionary<ArticleDocument[]>
}

export const ArticleList = ({ title, articles, menu }: Props) => {
  const { locale } = useSelector(selectLocale);
  return (
    <>
      <div className={styles.containerArticle}>
        <ArticleMenu categories={menu} />
        <Header as="h2" className={"x10spaceBefore"}>
          <Header.Content>
            {title ? ((title.split("-"))[1]) : ""}
          </Header.Content>
        </Header>
        {articles.filter(article => locale === ((article.lang!).split("-"))[0]).map(article => (<ArticleItem key={article.id} {...article} />))}
      </div>
      <Decoration />
    </>
  )
}
