import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider } from "semantic-ui-react"

export const Existing = () => {
  return (
    <Container>
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
      <Connect />
      <Divider />
      <a href="#/accounts/">
        <FormattedMessage {...messages.existTransfer} />
      </a>
    </Container>
  );
}
