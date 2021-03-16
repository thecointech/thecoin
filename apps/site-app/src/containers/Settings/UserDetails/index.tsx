import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { AccountVerified } from '../Verified';
import { Avatars } from '@thecointech/shared/components/Avatars';
import { Grid } from 'semantic-ui-react';
import styles from './styles.module.less';
import { CopyToClipboard } from '@thecointech/site-base/components/CopyToClipboard';

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
  return (
    <React.Fragment>
        <Grid className={ `${styles.userDetailHeader} x2spaceAfter` } stackable >
          <Grid.Row>
            <Grid.Column width={4} textAlign="center" verticalAlign="middle">
              <Avatars index="14" />
            </Grid.Column>
            <Grid.Column width={12} verticalAlign="middle">
              <div className={"font-label x4spaceBefore x4spaceAfter"}><FormattedMessage {...accountName}/></div>
              <div className={"font-big x4spaceAfter"}>{activeAccount?.name}</div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <AccountVerified verified={false} />
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...address}/></div>
        <div className={"font-big x4spaceAfter"}>
          {activeAccount?.address} <CopyToClipboard payload={activeAccount?.address!} />
        </div>
        <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...code}/></div>
        <div className={"x4spaceAfter"}><FormattedMessage {...codeInfos}/></div>
    </React.Fragment>
  );
}

