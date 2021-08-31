import React from "react";
import { FaqItem } from "./FaqItem";
import { Header, SemanticFLOATS } from "semantic-ui-react";
import { FAQDocument } from "components/Prismic/types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import styles from "./styles.module.less";
import { Dictionary } from "lodash";
import { Decoration } from "components/Decoration";
import { CategoryMenu } from "components/PrismicMenuByCategories";

type Props = {
  title?: string,
  faqs: FAQDocument[],
  menu: Dictionary<FAQDocument[]>
}

export const FaqList = ({ title, faqs, menu }: Props) => {
  const { locale } = useSelector(selectLocale);
  return (
    <>
    <div className={styles.containerFaq}>
      <CategoryMenu categories={menu} idForMenu={styles.menuFaq} railPosition={"right" as SemanticFLOATS} pathBeforeTheId="/faq/theme-" />
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          {title ? ((title.split("-"))[1]) : ""}
        </Header.Content>
      </Header>
      {faqs
            .filter(faq => locale === ((faq.lang!).split("-"))[0])
            .map(faq => (<FaqItem key={faq.id} {...faq} />))}
    </div>
    <Decoration />
    </>
  )
}