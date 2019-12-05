import React from "react"
import { Connect } from ".."
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container } from "semantic-ui-react"

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
      <div>
        <h4>
          <a href="#/accounts/restore">
            <FormattedMessage {...messages.existTransfer} />
          </a>
        </h4>
      </div>
    </Container>
  );
}