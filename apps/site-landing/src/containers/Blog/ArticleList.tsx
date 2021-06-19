import React from "react";
//import { Article } from "./Article";
import { Header, SemanticFLOATS } from "semantic-ui-react";
import { ArticleDocument } from "components/Prismic/types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import styles from "./styles.module.less";
import { CategoryMenu } from "components/PrismicMenuByCategories";
import { Dictionary } from "lodash";
import { Decoration } from "components/Decoration";
import { ArticleItem } from "./ArticleItem";

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
        <CategoryMenu categories={menu} idForMenu={styles.menuArticle} railPosition={"left" as SemanticFLOATS} pathBeforeTheId="/blog/theme-" />
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
