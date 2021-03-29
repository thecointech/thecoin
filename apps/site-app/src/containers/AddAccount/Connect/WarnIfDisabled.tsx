import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "semantic-ui-react";
import messages from './messages';
import { isWeb3Enabled } from "@thecointech/shared/utils/detection";

export const WarnIfDisabled = () =>
  !isWeb3Enabled()
    ? <Message warning>
      <Message.Header>
        <FormattedMessage {...messages.warningHeader} />
      </Message.Header>
      <p><FormattedMessage {...messages.warningP1} /></p>
      <p><FormattedMessage {...messages.warningP2} /></p>
    </Message>
    : null
