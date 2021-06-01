import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import messages from "./messages";
import { FAQs } from "./FAQs";
import styles from "./styles.module.less"

type Props = {
  faqs: FAQDocument[]
}
export const Welcome = (props: Props) => {

  console.log("starred=====",props.faqs)
  const starred =  props.faqs.filter(faq => faq.data.show_on_faq_home)
  return (
    <div className={styles.containerFaq}>
      <Header as="h2">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
      </Header>
      <FAQs faqs={starred} />
    </div>
  )
}
