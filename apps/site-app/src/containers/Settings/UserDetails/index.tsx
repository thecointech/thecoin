import * as React from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AccountVerify } from '../Verified';
import { Avatars } from '@thecointech/shared/components/Avatars';
import { Grid } from 'semantic-ui-react';
import { Account } from '@thecointech/shared/containers/Account';
import { CopyToClipboard } from '@thecointech/shared/components/CopyToClipboard';
import { DefaultAccountValues } from '@thecointech/account';
import { ReferralCode } from './ReferralCode';
import styles from './styles.module.less';

const translations = defineMessages({
  accountName : {
      defaultMessage: 'Account name',
      description: 'app.settings.userDetails.name: Label for the info for the tab User details in the setting page in the app'},
  address : {
      defaultMessage: 'Personal Details',
      description: 'app.settings.userDetails.address: Label for the info for the tab User details in the setting page in the app'},
});

export const UserDetails = () => {
  const { address, details, name} = AccountMap.useActive() ?? DefaultAccountValues;
  const accountApi = Account(address).useApi();
  // Should we check for latest?
  React.useEffect(() => {
    // Keep checking until the referral code turns up.
    if (details.status && !details.referralCode) {
      accountApi.checkKycStatus();
    }
  }, [details.status, details.referralCode]);


  return (
    <React.Fragment>
        <Grid className={ `${styles.userDetailHeader} x2spaceAfter` } stackable >
          <Grid.Row>
            <Grid.Column width={4} textAlign="center" verticalAlign="middle">
              <Avatars index="14" />
            </Grid.Column>
            <Grid.Column width={12} verticalAlign="middle">
              <div className={"font-label x4spaceBefore x4spaceAfter"}><FormattedMessage {...translations.accountName}/></div>
              <div className={"font-big x4spaceAfter"}>{name}</div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <AccountVerify details={details} address={address} />
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...translations.address}/></div>
        <div className={"font-big x4spaceAfter"}>
          {address} <CopyToClipboard payload={address!} />
        </div>
        <ReferralCode {...details} />
    </React.Fragment>
  );
}

