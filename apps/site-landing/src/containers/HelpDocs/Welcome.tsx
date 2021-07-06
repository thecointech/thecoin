import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { defineMessages, FormattedMessage } from "react-intl";
import { FaqList } from "./FaqList";
import { Dictionary } from "lodash";

type Props = {
  faqs: FAQDocument[],
  menu: Dictionary<FAQDocument[]>
}

const translations = defineMessages({
  title : {
      defaultMessage: 'FAQ',
      description: 'site.helpDocs.title: title for the FAQ page'}
  });

export const Welcome = (props: Props) => {
  const starred =  props.faqs.filter(faq => faq.data.show_on_faq_home);
  return (
    <div>
      <Header as="h2" textAlign={"center"} className={"x10spaceBefore"}>
          <FormattedMessage {...translations.title} />
      </Header>
      <FaqList menu={props.menu} faqs={starred} />
    </div>
  )
}
