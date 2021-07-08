import React, { useState, useCallback } from "react";
import { Header, Grid, Container } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { Props as MessageProps, MaybeMessage } from "../../../../components/MaybeMessage";
import { Link } from "react-router-dom";
import { useActiveAccount } from "@thecointech/shared/containers/AccountMap";
import { StoreGoogle, UploadState } from "../StoreOnline/Google";
import { onDownload } from "../StoreOnline/Localy/download";
import { StoreDropbox } from "../StoreOnline/Dropbox";
import { StoreMicrosoft } from "../StoreOnline/Microsoft";

import manually from "./images/manually.svg";
import google from "./images/google.svg";
import microsoft from "./images/microsoft.svg";
import dropbox from "./images/dropbox.svg";

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import { Decoration } from "../../Decoration";
import { ButtonPrimary } from "../../../../components/Buttons";
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';


const aboveTheTitle = { id:"app.account.create.store.aboveTheTitle",
                        defaultMessage:"Save your account",
                        description:"The above the main title title for the store your account page"};
const title = { id:"app.account.create.store.title",
                defaultMessage:"Ensure your safety",
                description:"The main title for the store your account page"};
const download = {  id:"app.account.create.store.button.download",
                    defaultMessage:"Download",
                    description:"The button to download the account for the store your account page"};
const explain = { id:"app.account.create.store.secureExplain",
                  defaultMessage:"To benefit from our guarantee of “the most secure account in the world”, you need to save it offline.",
                  description:"The text underneath the button to explain what is the most secured for the store your account page"};
const explainDownload = { id:"app.account.create.store.explainDownload",
                          defaultMessage:"Be sure you have access to your local files later.",
                          description:"The text underneath the button to explain that the client need to have access to this file for the store your account page"};
const congratulation = {  id:"app.account.create.store.button.congratulations",
                          defaultMessage:"Next Step",
                          description:"The button to be redirected to the congratulations page for the store your account page"};
const googleLink = {  id:"app.account.create.store.button.google",
                          defaultMessage:"Store on Google",
                          description:"The button to save on google for the store your account page"};
const microsoftLink = {  id:"app.account.create.store.button.microsoft",
                          defaultMessage:"Store on Microsoft OneDrive",
                          description:"The button to save on microsoft for the store your account page"};
const dropboxLink = {  id:"app.account.create.store.button.dropbox",
                          defaultMessage:"Store on Dropbox",
                          description:"The button to save on dropbox for the store your account page"};

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
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x8spaceAfter`}>
          <FormattedMessage {...title} />
      </Header>
      <MaybeMessage {...feedback} />

      <Grid stackable columns={4} id={sharedStyles.choices}>
        <Grid.Row>
          <Grid.Column>
              <a onClick={onDownloadClicked}>
                <img src={ manually } />
                <Header as={"h4"}><FormattedMessage {...download} /></Header>
              </a>
          </Grid.Column>
          <Grid.Column>
              <StoreGoogle onStateChange={onStateChange} disabled={uploadState === UploadState.Complete}>
                <img src={ google } />
                <Header as={"h4"}><FormattedMessage {...googleLink} /></Header>
              </StoreGoogle>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <StoreMicrosoft>
                  <img src={ microsoft } />
                  <Header as={"h4"}><FormattedMessage {...microsoftLink} /></Header>
                </StoreMicrosoft>
              </div>
            </AvailableSoon>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <StoreDropbox>
                  <img src={ dropbox } />
                  <Header as={"h4"}><FormattedMessage {...dropboxLink} /></Header>
                </StoreDropbox>
              </div>
              </AvailableSoon>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <div className={ `x6spaceBefore x8spaceAfter` }>
        <FormattedMessage {...explain} />
        <br />
        <FormattedMessage {...explainDownload} />
      </div>

      <ButtonPrimary as={Link} to="/congratulations" disabled={!backedUp} size="medium">
        <FormattedMessage {...congratulation} />
      </ButtonPrimary>
      <Decoration />
    </Container>
  )
}
