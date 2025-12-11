import React, { useEffect } from "react";
import { Prismic } from "components/Prismic";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/redux-intl';
import styles from "./styles.module.less";
import { Header } from 'semantic-ui-react';
import { FAQ as FAQSlice} from '@thecointech/site-prismic/components'
import { Decoration } from '../../components/Decoration';
import { CategoryMenu } from '../../components/PrismicMenuByCategories';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router';
import type { FaqDocument } from "@thecointech/site-prismic/types";

const translations = defineMessages({
  title: {
    defaultMessage: 'FAQs',
    description: 'site.helpDocs.title: title for the FAQ page'
  },
});


export const HelpDocs = () => {
  const actions = Prismic.useApi();
  const docs = useSelector((s: ApplicationRootState) => s.documents);
  const { locale } = useSelector(selectLocale);
  useEffect(() => {
    actions.fetchAllDocs(locale);
  }, [locale]);

  // Get selected categories from URL
  const [searchParams] = useSearchParams();
  const selectedCategories = new Set(searchParams.getAll('category'));

  const allFaqs = docs[locale].faqs
    ? [...docs[locale].faqs.values()]
    : [];
  const categories = buildCategories(allFaqs);
  const faqs = allFaqs.filter(faq => {
    return selectedCategories.size > 0
      ? !faq.data.category || selectedCategories.has(faq.data.category)
      : faq.data.show_on_faq_home
  })

  return (
    <>
      <div className={styles.containerFaq}>
        <Header as="h2" className={"x10spaceBefore"}>
          <Header.Content>
            <FormattedMessage {...translations.title} />
          </Header.Content>
        </Header>
        <CategoryMenu categories={categories} idForMenu={styles.menuFaq} railPosition={"right"} pathBeforeTheId="/faq/" />
        {faqs.map(faq => (<FAQSlice key={faq.id} document={faq} />))}
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
