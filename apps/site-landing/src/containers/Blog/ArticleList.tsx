import React, { useEffect } from "react";
import { Header, SemanticFLOATS } from "semantic-ui-react";
import { ArticleDocument } from "components/Prismic/types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/redux-intl/selector';
import { CategoryMenu } from "components/PrismicMenuByCategories";
import { Decoration } from "components/Decoration";
import { ArticleItem } from "./ArticleItem";
import { useParams } from 'react-router';
import { Prismic } from '../../components/Prismic/reducer';
import styles from "./styles.module.less";
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  title : {
      defaultMessage: 'Blog',
      description: 'site.blog.title: Title for the In-depth blog page'}
  });


export const ArticleList = () => {
  const { locale } = useSelector(selectLocale);
  const prismic = Prismic.useData();
  const actions = Prismic.useApi();
  const { category } = useParams<{category: string}>();
  useEffect(() => {
    actions.fetchAllDocs(locale);
  }, [locale]);

  const allArticles = [...prismic[locale].articles.values()];
  const categories = buildCategories(allArticles);

  const articles = category
    ? allArticles.filter(article => article.data.categories.find(c => c.category === category))
    : allArticles;
  return (
    <>
      <div className={styles.containerArticle}>
        <CategoryMenu categories={categories} idForMenu={styles.menuArticle} railPosition={"left" as SemanticFLOATS} pathBeforeTheId="/blog/category/" />
        <Header as="h2" className={"x10spaceBefore"}>
          <Header.Content>
            {category
              ? category
              : <FormattedMessage {...translations.title} />
            }
          </Header.Content>
        </Header>
        {articles.map(article => (<ArticleItem key={article.id} {...article} />))}
      </div>
      <Decoration />
    </>
  )
}

export function buildCategories(faqs: ArticleDocument[]) {
  return Array.from(
    new Set(
      faqs
        .map(faq => faq.data.categories)
        .reduce((acc, category) => acc.concat(
          category.map(c => c.category)
        ), [] as string[])
    )
  )
}
