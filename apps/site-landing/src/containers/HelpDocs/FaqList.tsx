import React from "react";
import { FaqItem } from "./FaqItem";
import { Header } from "semantic-ui-react";
import { FAQDocument } from "components/Prismic/types";
import styles from "./styles.module.less";

type Props = {
  title?: string,
  faqs: FAQDocument[]
}

export const FaqList = ({ title, faqs }: Props) => {
  return (
    <div className={styles.containerFaq}>
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          {title ? title : ""}
        </Header.Content>
      </Header>
      {faqs.map(faq => <FaqItem key={faq.id} {...faq} />)}
    </div>
  )
}
