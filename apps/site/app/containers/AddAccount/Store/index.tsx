import React, { useState, useCallback } from "react";
import { Header, Segment, Button, Grid, Container } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import messages from "./messages";
import { StoreGoogle, UploadState } from "containers/StoreOnline/Google";
import { Props as MessageProps, MaybeMessage } from "components/MaybeMessage";
import { Link } from "react-router-dom";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap";
import { onDownload } from "containers/Accounts/Settings/download";

import manually from "./images/manually.svg";
import google from "./images/google.svg";
import microsoft from "./images/microsoft.svg";
import dropbox from "./images/dropbox.svg";
import illustration from "./images/illust_flowers.svg";

import styles from './styles.module.css';

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
    <Container className={styles.content}>
      <Header as="h5">
          <FormattedMessage 
            id="site.Account.create.store.aboveTheTitle" 
            defaultMessage="Save your account" 
            description = "The above the main title title for the store your account page"/>
      </Header>
      <Header as="h2">
          <FormattedMessage 
            id="site.Account.create.store.title" 
            defaultMessage="Ensure your safety" 
            description = "The main title for the store your account page" />
      </Header>
      <MaybeMessage {...feedback} />
      
      <Grid stackable columns='equal' centered>
        <Grid.Row>
          <Grid.Column>
              <img src={ manually } />
          </Grid.Column>
          <Grid.Column>
              <img src={ google } />
              <StoreGoogle onStateChange={onStateChange} disabled={uploadState === UploadState.Complete} />
          </Grid.Column>
          <Grid.Column>
              <img src={ microsoft } />
          </Grid.Column>
          <Grid.Column>
              <img src={ dropbox } />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      
      <Segment>

        <Button as={Link} to="/accounts" disabled={!backedUp} primary size="big">
          <FormattedMessage {...messages.gotoAccount} />
        </Button>

        <div>
          <FormattedMessage 
            id="site.Account.create.store.secureExplain" 
            defaultMessage="To benefit from our guarantee of “the most secure account in the world”, you need to save it offline." 
            description = "The text underneath the button to explain what is the most secured for the store your account page" />
        </div>

        <div>
          <FormattedMessage 
            id="site.Account.create.store.download" 
            defaultMessage="Be sure you have access to your local files later." 
            description = "The text underneath the button to explain that the client need to have access to this file for the store your account page" />
            <p>
              <a onClick={onDownloadClicked}>download</a>
            </p>
        </div>

        <div className={styles.illustration} >
          <img src={illustration} />
        </div>
      </Segment>
    </Container>
  )
}