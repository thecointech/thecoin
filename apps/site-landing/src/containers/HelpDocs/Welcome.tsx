import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { FaqList } from "./FaqList";
import { FaqMenu } from "./FaqMenu";
import { Decoration } from "components/Decoration";
import messages from "./messages";


type Props = {
  faqs: FAQDocument[],
  menu: []
}
export const Welcome = (props: Props) => {

  console.log("starred=====",props.faqs)
  const starred =  props.faqs.filter(faq => faq.data.show_on_faq_home);
  return (
    <div>
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
      </Header>
      <FaqList faqs={starred} />
      <FaqMenu categories={props.menu} />
      <Decoration />
    </div>
  )
}
