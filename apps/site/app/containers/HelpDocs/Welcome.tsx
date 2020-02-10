import React from "react";
import { FAQDocument } from "containers/Prismic/types";
import { Header, Segment } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import messages from "./messages";
import { FAQs } from "./FAQs";

type Props = {
  faqs: FAQDocument[]
}
export const Welcome = (props: Props) => {

  const starred =  props.faqs
    .filter(faq => faq.data.starred)

  return (
    <>
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
      <Segment>
        <p><FormattedMessage {...messages.blurb} /></p>
      </Segment>
      <FAQs faqs={starred} />
    </>
  )
}
