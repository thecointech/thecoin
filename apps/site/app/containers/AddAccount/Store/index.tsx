import React, { useState, useCallback } from "react"
import { Header, Segment, Button } from "semantic-ui-react"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { StoreGoogle, UploadState } from "containers/StoreOnline/Google"
import { Props as MessageProps, MaybeMessage } from "components/MaybeMessage"
import { Link } from "react-router-dom"


export const Store = () => {

  const [feedback, setFeedback] = useState({} as MessageProps)
  const [backedUp, setBackedUp] = useState(false);
  const onStateChange = useCallback((state: UploadState, message: MessageProps) => {
    setFeedback(message);
    if (state == UploadState.Complete)
      setBackedUp(true);
  }, [setFeedback, setBackedUp])
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
    <MaybeMessage {...feedback} />
    <Segment>
      <p><FormattedMessage {...messages.infop1} /></p>
      <p><FormattedMessage {...messages.infop2} /></p>
      <StoreGoogle onStateChange={onStateChange} disabled={backedUp}/>
      <p><FormattedMessage {...messages.infop3} /></p>
      <Button as={Link} to="/accounts" disabled={!backedUp}>
        <FormattedMessage {...messages.gotoAccount} />
      </Button>
    </Segment>
  </>
  )
}