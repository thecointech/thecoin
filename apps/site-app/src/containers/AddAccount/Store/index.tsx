import React, { useState, useCallback } from "react";
import { Header, Button, Grid, Container } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { StoreGoogle, UploadState } from "containers/StoreOnline/Google";
import { Props as MessageProps, MaybeMessage } from "@the-coin/site-base/components/MaybeMessage";
import { Link } from "react-router-dom";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap";
import { onDownload } from "containers/Accounts/Settings/download";
import { StoreDropbox } from "containers/StoreOnline/Dropbox";
import { StoreMicrosoft } from "containers/StoreOnline/Microsoft";

import manually from "./images/manually.svg";
import google from "./images/google.svg";
import microsoft from "./images/microsoft.svg";
import dropbox from "./images/dropbox.svg";

import styles from './styles.module.less';
import { Decoration } from "components/Decoration";


const aboveTheTitle = { id:"site.Account.create.store.aboveTheTitle",
                        defaultMessage:"Save your account",
                        description:"The above the main title title for the store your account page"};
const title = { id:"site.Account.create.store.title",
                defaultMessage:"Ensure your safety",
                description:"The main title for the store your account page"};
const download = {  id:"site.Account.create.store.button.download",
                    defaultMessage:"Download",
                    description:"The button to download the account for the store your account page"};
const explain = { id:"site.Account.create.store.secureExplain",
                  defaultMessage:"To benefit from our guarantee of “the most secure account in the world”, you need to save it offline.",
                  description:"The text underneath the button to explain what is the most secured for the store your account page"};
const explainDownload = { id:"site.Account.create.store.explainDownload",
                          defaultMessage:"Be sure you have access to your local files later.",
                          description:"The text underneath the button to explain that the client need to have access to this file for the store your account page"};
const congratulation = {  id:"site.Account.create.store.button.congratulations",
                          defaultMessage:"Next Step",
                          description:"The button to be redirected to the congratulations page for the store your account page"};

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
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2">
          <FormattedMessage {...title} />
      </Header>
      <MaybeMessage {...feedback} />

      <Grid stackable centered columns={4} id={styles.choices}>
        <Grid.Row centered>
          <Grid.Column centered>
              <img src={ manually } />
              <br />
              <a onClick={onDownloadClicked}>
                <FormattedMessage {...download} />
              </a>
          </Grid.Column>
          <Grid.Column centered>
              <img src={ google } />
              <br />
              <StoreGoogle onStateChange={onStateChange} disabled={uploadState === UploadState.Complete} />
          </Grid.Column>
          <Grid.Column centered>
            <StoreMicrosoft>
              <img src={ microsoft } />
              <br />
            </StoreMicrosoft>
          </Grid.Column>
          <Grid.Column centered>
              <StoreDropbox>
                <img src={ dropbox } />
                <br />
              </StoreDropbox>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <div className={ `x6spaceBefore x8spaceAfter` }>
        <FormattedMessage {...explain} />
        <br />
        <FormattedMessage {...explainDownload} />
      </div>

      <Button as={Link} to="/congratulations" disabled={!backedUp} primary size="big">
        <FormattedMessage {...congratulation} />
      </Button>
      <Decoration />
    </Container>
  )
}
