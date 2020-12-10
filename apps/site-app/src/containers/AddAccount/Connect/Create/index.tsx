import React from "react";
import { Connect } from "../../Connect";
import { FormattedMessage, useIntl } from "react-intl";
import { Header, Container, Message, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { getWeb3Type } from "@the-coin/shared/utils/detection";
import { Decoration } from "components/Decoration";
import styles from './styles.module.less';


const aboveTheTitle = { id:"site.Account.connect.create.aboveTheTitle",
                defaultMessage:"Compatible account detected",
                description:"Title above the main Title for the create account form page"};
const title = { id:"site.Account.connect.create.title",
                defaultMessage:"Register it with TheCoin",
                description:"Title above the main Title for the create account form page"};
//const createTransfer = {  id:"site.Account.create.createTransfer",
//                            defaultMessage:"Or, you can create an entirely new account!",
//                           description:""};
const checkHeader = { id:"site.Account.connect.create.checkHeader",
                      defaultMessage:"Is this what you meant?",
                      description:""};
const checkMessageOpera = { id:"site.Account.connect.create.checkMessageOpera",
                            defaultMessage:"The Opera browser you are using comes with a built-in account that is compatible with TheCoin. Would you like to connect to it?",
                            description:""};
const checkHeaderFailed = { id:"site.Account.connect.create.checkHeaderFailed",
                            defaultMessage:"No compatible account detected!",
                            description:""};
const checkMessageFailed = { id:"site.Account.connect.create.checkMessageFailed",
                              defaultMessage:"We cannot detect a compatible account in this browser.  If you would like to use an external account provider, we recommend installing Metamask or using the Opera Browser",
                              description:""};
const explanation = { id:"site.account.restore.createAccount.explanation",
                      defaultMessage:"Don’t have an account?",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const buttonCreateAccount = { id:"site.account.restore.button.createAccount",
                              defaultMessage:"Create a New Account",
                              description:"The button to redirect to the create an account page for the restore your account page"};


//const BounceLink = () => 
//  <Link to="/addAccount/generate/">
//    <FormattedMessage {...createTransfer} />
//  </Link>

export const Create = () => {
  const intl = useIntl();
  const web3Type = getWeb3Type();

  return (
    <Container className={styles.content}>
      <Header as="h5">
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2">
          <FormattedMessage {...title} />
      </Header>

      {
        (web3Type === "Opera") &&
          <Message
            info
            header={intl.formatMessage(checkHeader)}
            content={intl.formatMessage(checkMessageOpera)}
          />
      }
      {
        !web3Type &&
          <Message
            warning
            header={intl.formatMessage(checkHeaderFailed)}
            content={intl.formatMessage(checkMessageFailed)}
          />
      }

      <Connect />
      <div className={`${styles.createAccountContent} x8spaceBefore x12spaceAfter`} >
          <FormattedMessage {...explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Button as={Link} to="/addAccount" primary size='medium' >
            <FormattedMessage {...buttonCreateAccount} />
          </Button>
      </div>
    </Container>
  );
}
