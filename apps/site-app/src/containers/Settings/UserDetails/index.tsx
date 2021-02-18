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
        <div className={"font-label x4spaceBefore x4spaceAfter"}><FormattedMessage {...accountName}/></div>
        <div className={"font-big x4spaceAfter"}>{activeAccount?.name}</div>
        <AccountVerified verified={false} />
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...address}/></div>
        <div className={"font-big x4spaceAfter"}>{activeAccount?.address}</div>
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...code}/></div>
        <div className={"x4spaceAfter"}><FormattedMessage {...codeInfos}/></div>
    </React.Fragment>
  );
}

