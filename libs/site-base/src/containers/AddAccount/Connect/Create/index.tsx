import React from "react";
import { Connect } from "../../Connect";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Header, Container, Message } from "semantic-ui-react";
import { Link } from "react-router";
import { getWeb3Type } from "@thecointech/shared/utils/detection";
import { Decoration } from "../../Decoration";
import styles from '../styles.module.less';
import { ButtonPrimary } from "../../../../components/Buttons";

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'Compatible account detected',
      description: 'app.account.connect.create.aboveTheTitle: Title above the main Title for the create account form page'},
  title : {
      defaultMessage: 'Register it with TheCoin',
      description: 'app.account.connect.create.title: Title above the main Title for the create account form page'},
  createTransfer : {
      defaultMessage: 'Or, you can create an entirely new account!',
      description: 'app.account.connect.create.createTransfer'},
  checkHeader : {
      defaultMessage: 'Is this what you meant?',
      description: 'app.account.connect.create.checkHeader'},
  checkMessageOpera : {
      defaultMessage: 'The Opera browser you are using comes with a built-in account that is compatible with TheCoin. Would you like to connect to it?',
      description: 'app.account.connect.create.checkMessageOpera'},
  checkHeaderFailed : {
      defaultMessage: 'No compatible account detected!',
      description: 'app.account.connect.create.checkHeaderFailed'},
  checkMessageFailed : {
      defaultMessage: 'We cannot detect a compatible account in this browser.  If you would like to use an external account provider, we recommend installing Metamask or using the Opera Browser',
      description: 'app.account.connect.create.checkMessageFailed'},
  explanation : {
      defaultMessage: 'Don’t have an account?',
      description: 'app.account.connect.create.explanation: The text before the button to redirect to the create an account page for the restore your account page'},
  buttonCreateAccount : {
      defaultMessage: 'Create a New Account',
      description: 'app.account.connect.create.createAccount: The button to redirect to the create an account page for the restore your account page'}
});

//const BounceLink = () =>
//  <Link to="/addAccount/generate/">
//    <FormattedMessage {...createTransfer} />
//  </Link>

export const Create = () => {
  const intl = useIntl();
  const web3Type = getWeb3Type();

  return (
    <Container className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...translations.aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x8spaceAfter`}>
          <FormattedMessage {...translations.title} />
      </Header>

      {
        (web3Type === "Opera") &&
          <Message
            info
            header={intl.formatMessage(translations.checkHeader)}
            content={intl.formatMessage(translations.checkMessageOpera)}
          />
      }
      {
        !web3Type &&
          <Message
            warning
            header={intl.formatMessage(translations.checkHeaderFailed)}
            content={intl.formatMessage(translations.checkMessageFailed)}
          />
      }

      <Connect />
      <div className={`x8spaceBefore x12spaceAfter`}>
          <FormattedMessage {...translations.explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount/generate/intro" size='medium' >
            <FormattedMessage {...translations.buttonCreateAccount} />
          </ButtonPrimary>
      </div>
      <Decoration />
    </Container>
  );
}
