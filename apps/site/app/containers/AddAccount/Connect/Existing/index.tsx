import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container } from "semantic-ui-react"
import { ExistsSwitcher } from "containers/AddAccount/ExistsSwitcher"

export const Existing = () => {
  
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
      <Connect />
      <ExistsSwitcher filter="connect" />
    </Container>
  );
}
