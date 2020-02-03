import React from "react"
import { Header, Button, List } from "semantic-ui-react"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { Link } from "react-router-dom"


export const Intro = () => {
  return (
    <>
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader2} />
        </Header.Subheader>
      </Header>
        <p><FormattedMessage {...messages.intro} /></p>
        <p><FormattedMessage {...messages.articles} /></p>
        <List>
          <List.Item>
            <Link to="/FAQ/creating-a-good-password" target="_blank">How to make a good password</Link>
          </List.Item>
          <List.Item>
            <Link to="/FAQ/creating-a-good-password" target="_blank">Where is my account stored?</Link>
          </List.Item>
        </List>
        <p><FormattedMessage {...messages.infoAdvantages} /></p>
      <Button as={Link} to="/addAccount/generate" id="buttonCreateAccountStep1">
        <FormattedMessage {...messages.newAccount} />
      </Button>
    </>
  )
}