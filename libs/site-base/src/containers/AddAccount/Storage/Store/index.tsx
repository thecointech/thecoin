import React from "react";
import { Header, Grid, Container } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { MaybeMessage } from "../../../../components/MaybeMessage";
import { Link } from "react-router-dom";
import { useActiveAccount } from "@thecointech/shared/containers/AccountMap";
import { OfflineStore } from "../Offline/Store";

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import { Decoration } from "../../Decoration";
import { ButtonPrimary } from "../../../../components/Buttons";
import { GDriveStore } from '../GDrive/Store';
import { OneDriveStore } from '../OneDrive/Store';
import { DropBoxStore } from '../Dropbox/Store';


const aboveTheTitle = { id:"app.account.create.store.aboveTheTitle",
                        defaultMessage:"Save your account",
                        description:"The above the main title title for the store your account page"};
const title = { id:"app.account.create.store.title",
                defaultMessage:"Ensure your safety",
                description:"The main title for the store your account page"};
const explain = { id:"app.account.create.store.secureExplain",
                  defaultMessage:"To benefit from our guarantee of “the most secure account in the world”, you need to save it offline.",
                  description:"The text underneath the button to explain what is the most secured for the store your account page"};
const explainDownload = { id:"app.account.create.store.explainDownload",
                          defaultMessage:"Be sure you have access to your local files later.",
                          description:"The text underneath the button to explain that the client need to have access to this file for the store your account page"};
const congratulation = {  id:"app.account.create.store.button.congratulations",
                          defaultMessage:"Next Step",
                          description:"The button to be redirected to the congratulations page for the store your account page"};

export const Store = () => {

  const feedback = {};
  // const [feedback, setFeedback] = useState({} as MessageProps)
  // const [uploadState, setUploadState] = useState(UploadState.Waiting);
  //const [backedUp, setBackedUp] = useState(false);
  const activeAccount = useActiveAccount();

  const isBackedUp = (
    activeAccount?.details?.storedOffline ||
    activeAccount?.details?.storedOnGoogle ||
    activeAccount?.details?.storedOnDropbox ||
    activeAccount?.details?.storedOnOneDrive
  );


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
            <OfflineStore />
          </Grid.Column>
          <Grid.Column>
            <GDriveStore />
          </Grid.Column>
          <Grid.Column>
            <OneDriveStore />
          </Grid.Column>
          <Grid.Column>
            <DropBoxStore />
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <div className={ `x6spaceBefore x8spaceAfter` }>
        <FormattedMessage {...explain} />
        <br />
        <FormattedMessage {...explainDownload} />
      </div>

      <ButtonPrimary as={Link} to="/congratulations" disabled={!isBackedUp} size="medium">
        <FormattedMessage {...congratulation} />
      </ButtonPrimary>
      <Decoration />
    </Container>
  )
}
