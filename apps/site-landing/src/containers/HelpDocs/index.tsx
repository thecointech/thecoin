import React, { useEffect } from "react";
import { Prismic } from "components/Prismic";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/redux-intl';
import styles from "./styles.module.less";
import { Header } from 'semantic-ui-react';
import { FaqItem } from './FaqItem';
import { Decoration } from '../../components/Decoration';
import { CategoryMenu } from '../../components/PrismicMenuByCategories';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import type { FaqDocument } from "@thecointech/site-prismic/types";

const translations = defineMessages({
  title : {
      defaultMessage: 'FAQ',
      description: 'site.helpDocs.title: title for the FAQ page'}
  });


export const HelpDocs = () => {
  const actions = Prismic.useApi();
  const docs = useSelector((s: ApplicationRootState) => s.documents);
  const { locale } = useSelector(selectLocale);
  useEffect(() => {
    actions.fetchAllDocs(locale);
  }, [locale]);

  const { category } = useParams<{category: string|undefined}>();
  const allFaqs = docs[locale].faqs
    ? [...docs[locale].faqs.values()]
    : [];
  const categories = buildCategories(allFaqs);
  const faqs = allFaqs.filter(faq => {
    return category
      ? faq.data.category == category
      : faq.data.show_on_faq_home
  })

  return (
    <>
      <div className={styles.containerFaq}>
        <CategoryMenu categories={categories} idForMenu={styles.menuFaq} railPosition={"right"} pathBeforeTheId="/faq/" />
        <Header as="h2" className={"x10spaceBefore"}>
          <Header.Content>
            {category ?? <FormattedMessage {...translations.title} />}
          </Header.Content>
        </Header>
        {faqs.map(faq => (<FaqItem key={faq.id} {...faq} />))}
      </div>
      <Decoration />
    </>
  );
}

export function buildCategories(faqs: FaqDocument[]) {
  return Array.from(
    new Set(faqs.map(faq => faq.data.category ?? "Default"))
  )
}
