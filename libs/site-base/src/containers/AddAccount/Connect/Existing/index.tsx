import React from "react";
import { Connect } from "../../Connect";
import { defineMessages, FormattedMessage } from "react-intl";
import { Header, Container } from "semantic-ui-react";
import { Link, useLocation } from "react-router";
import { Decoration } from "../../Decoration";
import styles from '../styles.module.less';
import { ButtonPrimary } from "../../../../components/Buttons";

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'Compatible account detected',
      description: 'app.account.connect.existing.aboveTheTitle: Title above the main Title for the connect account form page'},
  title : {
      defaultMessage: 'Register it with TheCoin',
      description: 'app.account.connect.existing.title: Title above the main Title for the connect account form page'},
  explanation : {
      defaultMessage: 'Don’t have an account?',
      description: 'app.account.restore.createAccount.explanation: The text before the button to redirect to the create an account page for the restore your account page'},
  buttonCreateAccount : {
      defaultMessage: 'Create a New Account',
      description: 'app.account.restore.button.createAccount: The button to redirect to the create an account page for the restore your account page'}
});

export const Existing = () => {
  const location = useLocation();
  const preservedQuery = location.search;

  return (
    <Container className={styles.content}>
    <Header as="h5" className={`x8spaceBefore`}>
        <FormattedMessage {...translations.aboveTheTitle} />
    </Header>
      <Header as="h2">
          <FormattedMessage {...translations.title} />
      </Header>
      <Connect />
      <div className={`${styles.createAccountContent} x8spaceBefore x12spaceAfter`} >
          <FormattedMessage {...translations.explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to={`/addAccount/generate/intro${preservedQuery}`} size='medium' >
            <FormattedMessage {...translations.buttonCreateAccount} />
          </ButtonPrimary>
      </div>
      <Decoration />
    </Container>
  );
}
