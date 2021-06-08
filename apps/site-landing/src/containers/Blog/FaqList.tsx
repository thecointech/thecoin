import React from "react";
import { FaqItem } from "./FaqItem";
import { Header } from "semantic-ui-react";
import { ArticleDocument } from "components/Prismic/types";
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import styles from "./styles.module.less";
import { FaqMenu } from "./FaqMenu";
import { Dictionary } from "lodash";
import { Decoration } from "components/Decoration";

type Props = {
  title?: string,
  faqs: ArticleDocument[],
  menu: Dictionary<ArticleDocument[]>
}

export const FaqList = ({ title, faqs, menu }: Props) => {
  const { locale } = useSelector(selectLocale);
  return (
    <>
    <div className={styles.containerFaq}>
      <FaqMenu categories={menu} />
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          {title ? ((title.split("-"))[1]) : ""}
        </Header.Content>
      </Header>
      {faqs.filter(faq => locale === ((faq.lang!).split("-"))[0]).map(faq => (<FaqItem key={faq.id} {...faq} />))}
    </div>
    <Decoration />
    </>
  )
}
