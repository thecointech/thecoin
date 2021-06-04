import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { FaqList } from "./FaqList";
import { Decoration } from "components/Decoration";
import messages from "./messages";
import { Dictionary } from "lodash";


type Props = {
  faqs: FAQDocument[],
  menu: Dictionary<FAQDocument[]>
}
export const Welcome = (props: Props) => {
  const starred =  props.faqs.filter(faq => faq.data.show_on_faq_home);
  return (
    <div>
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
      </Header>
      <FaqList menu={props.menu} faqs={starred} />
      <Decoration />
    </div>
  )
}
