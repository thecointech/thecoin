import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage, useIntl } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider, Message } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { getWeb3Type } from "utils/detection"

const BounceLink = () => 
  <Link to="/accounts/generate">
    <FormattedMessage {...messages.createTransfer} />
  </Link>

export const Create = () => {
  const intl = useIntl();
  const web3Type = getWeb3Type();

  return (
    <Container id="formCreateAccountStep1">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>

      {
        (web3Type === "Opera") &&
          <Message
            info
            header={intl.formatMessage(messages.checkHeader)}
            content={intl.formatMessage(messages.checkMessageOpera)}
          />
      }
      {
        !web3Type &&
          <Message
            warning
            header={intl.formatMessage(messages.checkHeaderFailed)}
            content={intl.formatMessage(messages.checkMessageFailed)}
          />
      }

      <Connect />
      <Divider text="Or"/>
      <BounceLink />
    </Container>
  );
}
