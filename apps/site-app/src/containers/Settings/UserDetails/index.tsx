import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { AccountVerified } from '../Verified';


const accountName = { id:"app.settings.userDetails.name",
                defaultMessage:"Account name",
                description:"Label for the info for the tab User details in the setting page in the app" };
const address = { id:"app.settings.userDetails.address",
                defaultMessage:"Personal Details",
                description:"Label for the info for the tab User details in the setting page in the app" };
const code = { id:"app.settings.userDetails.code",
                defaultMessage:"Referral code",
                description:"Label for the info for the tab User details in the setting page in the app" };
const codeInfos = { id:"app.settings.userDetails.codeInfos",
                defaultMessage:"You need to verify your account to obtain one",
                description:"Infos for the info for the tab User details in the setting page in the app" };

export const UserDetails = () => {

  const activeAccount = useActiveAccount();
  console.log(activeAccount)
  return (
    <React.Fragment>
        <div><FormattedMessage {...accountName}/></div>
        <div>{activeAccount?.name}</div>
        <AccountVerified verified={false} />
        <hr />
        <div><FormattedMessage {...address}/></div>
        <div>{activeAccount?.address}</div>
        <hr />
        <div><FormattedMessage {...code}/></div>
        <div><FormattedMessage {...codeInfos}/></div>
    </React.Fragment>
  );
}

