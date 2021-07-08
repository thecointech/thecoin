import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AccountVerified } from '../Verified';
import { Avatars } from '@thecointech/shared/components/Avatars';
import { Grid } from 'semantic-ui-react';
import styles from './styles.module.less';
import { CopyToClipboard } from '@thecointech/site-base/components/CopyToClipboard';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';

const translations = defineMessages({
  accountName : {
      defaultMessage: 'Account name',
      description: 'app.settings.userDetails.name: Label for the info for the tab User details in the setting page in the app'},
  address : {
      defaultMessage: 'Personal Details',
      description: 'app.settings.userDetails.address: Label for the info for the tab User details in the setting page in the app'},
  code : {
      defaultMessage: 'Referral code',
      description: 'app.settings.userDetails.code: Label for the info for the tab User details in the setting page in the app'},
  codeInfos : {
      defaultMessage: 'You need to verify your account to obtain one',
      description: 'app.settings.userDetails.codeInfos: Label for the info for the tab User details in the setting page in the app'}
});

export const UserDetails = () => {
  const activeAccount = useActiveAccount();
  return (
    <React.Fragment>
        <Grid className={ `${styles.userDetailHeader} x2spaceAfter` } stackable >
          <Grid.Row>
            <Grid.Column width={4} textAlign="center" verticalAlign="middle">
              <Avatars index="14" />
            </Grid.Column>
            <Grid.Column width={12} verticalAlign="middle">
              <div className={"font-label x4spaceBefore x4spaceAfter"}><FormattedMessage {...translations.accountName}/></div>
              <div className={"font-big x4spaceAfter"}>{activeAccount?.name}</div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <AvailableSoon><AccountVerified verified={false} /></AvailableSoon>
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...translations.address}/></div>
        <div className={"font-big x4spaceAfter"}>
          {activeAccount?.address} <CopyToClipboard payload={activeAccount?.address!} />
        </div>
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...translations.code}/></div>
        <div className={"x4spaceAfter"}><FormattedMessage {...translations.codeInfos}/></div>
    </React.Fragment>
  );
}

