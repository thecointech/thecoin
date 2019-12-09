import React from "react"
import { Connect } from "../../Connect"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider } from "semantic-ui-react"
import { Link } from "react-router-dom"

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
      <Divider text="Or"/>
      <Link to="/accounts/generate">
        <FormattedMessage {...messages.createTransfer} />
      </Link>
    </Container>
  );
}
