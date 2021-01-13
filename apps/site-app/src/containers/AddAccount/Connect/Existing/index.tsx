import React from "react";
import { Connect } from "../../Connect";
import { FormattedMessage } from "react-intl";
import { Header, Container } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Decoration } from "components/Decoration";
import styles from '../styles.module.less';
import { ButtonPrimary } from "@the-coin/site-base/components/Buttons";


const aboveTheTitle = { id:"app.account.connect.existing.aboveTheTitle",
                defaultMessage:"Compatible account detected",
                description:"Title above the main Title for the connect account form page"};
const title = { id:"app.account.connect.existing.title",
                defaultMessage:"Register it with TheCoin",
                description:"Title above the main Title for the connect account form page"};
const explanation = { id:"app.account.restore.createAccount.explanation",
                      defaultMessage:"Don’t have an account?",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const buttonCreateAccount = { id:"app.account.restore.button.createAccount",
                              defaultMessage:"Create a New Account",
                              description:"The button to redirect to the create an account page for the restore your account page"};

export const Existing = () => {
  
  return (
    <Container className={styles.content}>
    <Header as="h5">
        <FormattedMessage {...aboveTheTitle} />
    </Header>
      <Header as="h2">
          <FormattedMessage {...title} />
      </Header>
      <Connect />
      <div className={`${styles.createAccountContent} x8spaceBefore x12spaceAfter`} >
          <FormattedMessage {...explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount" size='medium' >
            <FormattedMessage {...buttonCreateAccount} />
          </ButtonPrimary>
      </div>
      <Decoration />
    </Container>
  );
}
