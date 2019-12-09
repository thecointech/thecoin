import React from "react"
import { Connect } from "../../Connect"
import { useIntl, FormattedMessage } from "react-intl"
import messages from "./messages"
import { Header, Container, Divider, Dropdown } from "semantic-ui-react"

export const Create = () => {
  const intl = useIntl();

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
      <Dropdown text={intl.formatMessage(messages.createTransfer)}>
        <Dropdown.Menu>
          <Dropdown.Item text='New' />
          <Dropdown.Item text='Open...' description='ctrl + o' />
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
}
