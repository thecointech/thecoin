import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider, Message } from "semantic-ui-react"
import { Link } from "react-router-dom"

export const Create = () => {

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

      <Message
          info
          header='Was this what you wanted?'
          content="Your browser already has an account compatible with the Coin. Would you like to connect with it?"
        />

      <Connect />
      <Divider text="Or"/>
      <Link to="/accounts/generate">
        <FormattedMessage {...messages.createTransfer} />
      </Link>
    </Container>
  );
}
