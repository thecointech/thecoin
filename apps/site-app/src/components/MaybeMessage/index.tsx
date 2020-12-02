import React from "react"
import { MessageDescriptor, FormattedMessage } from "react-intl";
import { Message } from "semantic-ui-react";

export type Props = {
  header?: MessageDescriptor,
  content?: MessageDescriptor,
  info?: boolean,
  success?: boolean,
  negative?: boolean,
}
export const MaybeMessage = (props: Props) => {
  const { header, content, ...rest } = props;
  return (!header && !content)
    ? null
    : <Message {...rest}>
        <Message.Header>
          <FormattedMessage {...header} />
        </Message.Header>
        <p><FormattedMessage {...content} /></p>
      </Message>
}