import React, { useEffect } from "react";
import { Header } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/redux-intl';
import { CategoryMenu } from "components/PrismicMenuByCategories";
import { Decoration } from "components/Decoration";
import { ArticleItem } from "./ArticleItem";
import { useSearchParams } from 'react-router';
import { Prismic } from '../../components/Prismic/reducer';
import styles from "./styles.module.less";
import { defineMessages, FormattedMessage } from 'react-intl';
import type { ArticleDocument } from "@thecointech/site-prismic/types";

const translations = defineMessages({
  title : {
      defaultMessage: 'Blog',
      description: 'site.blog.title: Title for the In-depth blog page'}
  });


export const ArticleList = () => {
  const { locale } = useSelector(selectLocale);
  const prismic = Prismic.useData();
  const actions = Prismic.useApi();

  useEffect(() => {
    actions.fetchAllDocs(locale);
  }, [locale]);

  // Get selected categories from URL
  const [searchParams] = useSearchParams();
  const selectedCategories = new Set(searchParams.getAll('category'));

  const allArticles = [...prismic[locale].articles.values()];
  const categories = buildCategories(allArticles);

  const articles = selectedCategories.size > 0
    ? allArticles.filter(article => article.data.categories.find(c => !c.category || selectedCategories.has(c.category)))
    : allArticles;
  return (
    <>
      <div className={styles.containerArticle}>
        <Header as="h2" className={"x10spaceBefore"}>
          <Header.Content>
            <FormattedMessage {...translations.title} />
          </Header.Content>
        </Header>
        <CategoryMenu categories={categories} idForMenu={styles.menuArticle} railPosition={"left"} />
        {articles.map(article => (<ArticleItem key={article.id} {...article} />))}
      </div>
      <Decoration />
    </>
  )
}

export function buildCategories(articles: ArticleDocument[]) {
  return Array.from(
    new Set(
      articles
        .map(article => article.data.categories)
        .reduce((acc, category) => acc.concat(
          category.map(c => c.category ?? "Default")
        ), [] as string[])
    )
  )
}
