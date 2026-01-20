import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Message } from "semantic-ui-react";
import { isWeb3Enabled } from "@thecointech/shared/utils";

const translations = defineMessages({
  warningHeader : {
      defaultMessage: 'No external providers detected!',
      description: 'app.addAccount.connect.warnIfDisabled.warningHeader'},
  warningP1 : {
      defaultMessage: 'This feature connects The Coin to an external Web3 account provider.',
      description: 'app.addAccount.connect.warnIfDisabled.warningHeader'},
  warningP2 : {
      defaultMessage: 'To use this feature, either install the MetaMask plugin or try the new Opera browser!',
      description: 'app.account.restore.createAccount.explanation'}
});

export const WarnIfDisabled = () =>
  !isWeb3Enabled()
    ? <Message warning>
      <Message.Header>
        <FormattedMessage {...translations.warningHeader} />
      </Message.Header>
      <p><FormattedMessage {...translations.warningP1} /></p>
      <p><FormattedMessage {...translations.warningP2} /></p>
    </Message>
    : null
