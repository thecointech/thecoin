import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container } from "semantic-ui-react"

export const Create = () => {
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
        <a href="accounts/generate/"><FormattedMessage {...messages.createTransfer} /></a>
      </div>
    </Container>
  );
}
