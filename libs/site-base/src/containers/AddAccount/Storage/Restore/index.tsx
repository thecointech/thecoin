import React, {  } from 'react';
import { Header, Grid } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import microsoft from "../images/microsoft.svg";
import dropbox from "../images/dropbox.svg";

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import { Link } from 'react-router-dom';
import { Decoration } from '../../Decoration';
import { ButtonPrimary } from '../../../../components/Buttons';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { OfflineRestore } from '../Offline/Restore';
import { GDriveRestore } from '../GDrive/Restore';


const aboveTheTitle = { id:"app.account.restore.aboveTheTitle",
                        defaultMessage:"Restore Account",
                        description:"The above the title text for the restore account page"};
const title = { id:"app.account.restore.title",
                defaultMessage:"Welcome back to TheCoin!",
                description:"The main title for the restore account page"};

const microsoftLink = { id:"app.account.restore.microsoft",
                        defaultMessage:"Restore from Microsoft OneDrive",
                        description:"Microsoft link for the restore your account page"};
const dropboxLink = { id:"app.account.restore.dropbox",
                      defaultMessage:"Restore from Dropbox",
                      description:"Dropbox link for the restore your account page"};
const otherEthereum = { id:"app.account.restore.otherEthereum.explanation",
                        defaultMessage:"Also you can log into your account using an existing Ethereum account.",
                        description:"The link to redirect to use your existing ethereum for the restore your account page"};
const restoreHelp = { id:"app.account.restore.help",
                      defaultMessage:"If you have any problems with restoring your account, contact us for help.",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const explanation = { id:"app.account.restore.createAccount.explanation",
                      defaultMessage:"Don’t have an account?",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const buttonCreateAccount = { id:"app.account.restore.button.createAccount",
                              defaultMessage:"Create Account",
                              description:"The button to redirect to the create an account page for the restore your account page"};

export const Restore = () => {

  return (
    <div className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x8spaceAfter`}>
          <FormattedMessage {...title} />
      </Header>

      <Grid stackable columns={4} id={sharedStyles.choices}>
        <Grid.Row>
          <Grid.Column>
            <OfflineRestore />
          </Grid.Column>
          <Grid.Column>
            <GDriveRestore />
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <a className={"x8spaceAfter"}>
                  <img src={ microsoft } />
                  <Header as={"h4"}><FormattedMessage {...microsoftLink} /></Header>
                </a>
              </div>
            </AvailableSoon>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <a className={"x8spaceAfter"}>
                  <img src={ dropbox } />
                  <Header as={"h4"}><FormattedMessage {...dropboxLink} /></Header>
                </a>
              </div>
            </AvailableSoon>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className={ `x8spaceBefore` }>
        <b>
        <FormattedMessage {...otherEthereum} />
        </b>
      </div>
      <div className={ `x4spaceBefore x8spaceBefore` }>
        <FormattedMessage {...restoreHelp} />
      </div>
      <div className={styles.createAccountContent} >
          <FormattedMessage {...explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount" size='medium' >
            <FormattedMessage {...buttonCreateAccount} />
          </ButtonPrimary>
        </div>
        <Decoration />
    </div>
  );
}
