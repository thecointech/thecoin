import React from "react";
import { Connect } from "../../Connect";
import { FormattedMessage } from "react-intl";
import { Header, Container, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Decoration } from "components/Decoration";
import styles from './styles.module.less';


const aboveTheTitle = { id:"site.Account.connect.existing.aboveTheTitle",
                defaultMessage:"Compatible account detected",
                description:"Title above the main Title for the connect account form page"};
const title = { id:"site.Account.connect.existing.title",
                defaultMessage:"Register it with TheCoin",
                description:"Title above the main Title for the connect account form page"};
const explanation = { id:"site.account.restore.createAccount.explanation",
                      defaultMessage:"Don’t have an account?",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const buttonCreateAccount = { id:"site.account.restore.button.createAccount",
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
          <Button as={Link} to="/addAccount" primary size='medium' >
            <FormattedMessage {...buttonCreateAccount} />
          </Button>
      </div>
      <Decoration />
    </Container>
  );
}
