import React, { useState, useCallback } from "react";
import { Header, Grid, Container } from "semantic-ui-react";
import { defineMessages, FormattedMessage } from "react-intl";
import { StoreGoogle, UploadState } from "containers/StoreOnline/Google";
import { Props as MessageProps, MaybeMessage } from "@thecointech/site-base/components/MaybeMessage";
import { Link } from "react-router-dom";
import { useActiveAccount } from "@thecointech/shared/containers/AccountMap";
import { onDownload } from "containers/Settings/StorageOptions/download";
import { StoreDropbox } from "containers/StoreOnline/Dropbox";
import { StoreMicrosoft } from "containers/StoreOnline/Microsoft";

import manually from "./images/manually.svg";
import google from "./images/google.svg";
import microsoft from "./images/microsoft.svg";
import dropbox from "./images/dropbox.svg";

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import { Decoration } from "components/Decoration";
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'Save your account',
      description: 'app.account.create.store.aboveTheTitle: The above the main title title for the store your account page'},
  title : {
      defaultMessage: 'Ensure your safety',
      description: 'app.account.create.store.title: The main title for the store your account page'},
  download : {
      defaultMessage: 'Ensure your safety',
      description: 'app.account.create.store.download: The button to download the account for the store your account page'},
  explain : {
      defaultMessage: 'To benefit from our guarantee of “the most secure account in the world”, you need to save it offline.',
      description: 'app.account.create.store.explain: The text underneath the button to explain what is the most secured for the store your account page'},
  explainDownload : {
      defaultMessage: 'Be sure you have access to your local files later.',
      description: 'app.account.create.store.explainDownload: The text underneath the button to explain that the client need to have access to this file for the store your account page'},
  congratulation : {
      defaultMessage: 'Next Step',
      description: 'app.account.create.store.congratulation: The button to be redirected to the congratulations page for the store your account page'},
  googleLink : {
      defaultMessage: 'Store on Google',
      description: 'app.account.create.store.button.google: The button to save on google for the store your account page'},
  microsoftLink : {
      defaultMessage: 'Store on Microsoft OneDrive',
      description: 'app.account.create.store.button.microsoftLink: The button to save on microsoft for the store your account page'},
  dropboxLink : {
      defaultMessage: 'Store on Dropbox',
      description: 'app.account.create.store.button.dropbox: The button to save on dropbox for the store your account page'}
});

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
          <FormattedMessage {...translations.aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x8spaceAfter`}>
          <FormattedMessage {...translations.title} />
      </Header>
      <MaybeMessage {...feedback} />

      <Grid stackable columns={4} id={sharedStyles.choices}>
        <Grid.Row>
          <Grid.Column>
              <a onClick={onDownloadClicked}>
                <img src={ manually } />
                <Header as={"h4"}><FormattedMessage {...translations.download} /></Header>
              </a>
          </Grid.Column>
          <Grid.Column>
              <StoreGoogle onStateChange={onStateChange} disabled={uploadState === UploadState.Complete}>
                <img src={ google } />
                <Header as={"h4"}><FormattedMessage {...translations.googleLink} /></Header>
              </StoreGoogle>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <StoreMicrosoft>
                  <img src={ microsoft } />
                  <Header as={"h4"}><FormattedMessage {...translations.microsoftLink} /></Header>
                </StoreMicrosoft>
              </div>
            </AvailableSoon>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <StoreDropbox>
                  <img src={ dropbox } />
                  <Header as={"h4"}><FormattedMessage {...translations.dropboxLink} /></Header>
                </StoreDropbox>
              </div>
              </AvailableSoon>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <div className={ `x6spaceBefore x8spaceAfter` }>
        <FormattedMessage {...translations.explain} />
        <br />
        <FormattedMessage {...translations.explainDownload} />
      </div>

      <ButtonPrimary as={Link} to="/congratulations" disabled={!backedUp} size="medium">
        <FormattedMessage {...translations.congratulation} />
      </ButtonPrimary>
      <Decoration />
    </Container>
  )
}
