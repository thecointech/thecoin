import React from "react"
import { Header, Segment } from "semantic-ui-react"
import { FormattedMessage } from "react-intl"
import messages from "./messages"


export const Store = () => {
  return (
  <>
    <Header as="h1">
      <Header.Content>
        <FormattedMessage {...messages.header} />
      </Header.Content>
      <Header.Subheader>
        <FormattedMessage {...messages.subHeader} />
      </Header.Subheader>
    </Header>
    <Segment>
      <p><FormattedMessage {...messages.infop1} /></p>
      <p><FormattedMessage {...messages.infop2} /></p>
    </Segment>
  </>
  )
}