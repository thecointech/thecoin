import React, { useEffect } from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AccountVerify } from '../Verified';
import { Avatars } from '@thecointech/shared/components/Avatars';
import { Grid } from 'semantic-ui-react';
import { Account } from '@thecointech/shared/containers/Account';
import { CopyToClipboard } from '@thecointech/shared/components/CopyToClipboard';
import { ReferralCode } from './ReferralCode';
import { getAccountName } from '@thecointech/account';
import { isKycComplete, isReferralComplete } from '@thecointech/account-details';
import styles from './styles.module.less';
import { log } from '@thecointech/logging';

const translations = defineMessages({
  accountName : {
      defaultMessage: 'Account name',
      description: 'app.settings.userDetails.name: Label for the info for the tab User details in the setting page in the app'},
  address : {
      defaultMessage: 'Personal Details',
      description: 'app.settings.userDetails.address: Label for the info for the tab User details in the setting page in the app'},
});

const KycPollingInterval = (process.env.NODE_ENV === 'production')
  ? 5 * 60 * 1000 // 5 minutes
  : 5 * 1000; // 5 seconds

export const UserDetails = () => {
  const account = AccountMap.useActive()!;
  const { address, details, readonly } = account;
  const name = getAccountName(account);
  const accountApi = Account(address).useApi();
  // Allow for manually forcing a re-verify of an account
  const forceVerify = window.location.hash == "#/settings?forceVerify=true";

  // Run-once on mount (for each account)
  useEffect(() => {
    if (!details.basic) {
      log.info('Loading basic details for account', { address });
      accountApi.loadBasicDetails();
    }
  }, [address]);

  // Poll for KYC status updates if started but not yet complete
  useEffect(() => {
    if (readonly || !details.basic?.kycStage) return;
    if (isKycComplete(details.basic) && isReferralComplete(details.basic)) return;

    // Trigger polling
    let timer: NodeJS.Timeout;
    const tick = () => {
      log.info({address}, 'Polling for KYC status update');
      accountApi.loadBasicDetails();
      timer = setTimeout(tick, KycPollingInterval);
    };
    timer = setTimeout(tick, KycPollingInterval);
    return () => clearTimeout(timer);
  }, [details.basic]);

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
        <AccountVerify details={details} address={address} forceVerify={forceVerify} readonly={readonly} />
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} >
          <FormattedMessage {...translations.address}/>
        </div>
        <div className={"font-big x4spaceAfter"}>
          {address} <CopyToClipboard payload={address!} />
        </div>
        <ReferralCode basic={details.basic} />
    </React.Fragment>
  );
}

