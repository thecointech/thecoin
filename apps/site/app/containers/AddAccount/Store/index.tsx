import React, { useState, useCallback } from "react"
import { Header, Segment, Button } from "semantic-ui-react"
import { FormattedMessage } from "react-intl"
import messages from "./messages"
import { StoreGoogle, UploadState } from "containers/StoreOnline/Google"
import { Props as MessageProps, MaybeMessage } from "components/MaybeMessage"
import { Link } from "react-router-dom"
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap"
import { onDownload } from "containers/Accounts/Settings/download"


export const Store = () => {

  const [feedback, setFeedback] = useState({} as MessageProps)
  const [uploadState, setUploadState] = useState(UploadState.Waiting);
  const [backedUp, setBackedUp] = useState(false);
  const activeAccount = useActiveAccount();

  ////////////////////////////////
  const onStateChange = useCallback((state: UploadState, message: MessageProps) => {
    setFeedback(message);
    setUploadState(state);
    if (state == UploadState.Complete)
      setBackedUp(true);
  }, [setFeedback, setBackedUp, setUploadState])

  ////////////////////////////////
  const onDownloadClicked = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    onDownload(activeAccount!.address);
    setBackedUp(true);
  }, [activeAccount]);

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
        <StoreGoogle onStateChange={onStateChange} disabled={uploadState === UploadState.Complete} />
        <p><FormattedMessage {...messages.infop3} /></p>
        <p>
          <a onClick={onDownloadClicked}>download</a>
        </p>

        <Button as={Link} to="/accounts" disabled={!backedUp}>
          <FormattedMessage {...messages.gotoAccount} />
        </Button>
      </Segment>
    </>
  )
}