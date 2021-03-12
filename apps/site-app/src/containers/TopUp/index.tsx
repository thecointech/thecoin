import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { RecentTransactions } from '@the-coin/shared/containers/RecentTransactions';
import * as React from 'react';
import illustration from './images/icon_topup_big.svg';
import {AppContainerForTabs, AppContainerWithShadow} from 'components/AppContainers';

import { Grid, Header, Tab } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Purchase } from 'containers/TopUp/Purchase';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';


const title = { id:"app.topup.title",
                defaultMessage:"Topup balance",
                description:"Main title for the topup page in the app" };
const description = { id:"app.topup.description",
                      defaultMessage:"Transfer funds from your Canadian bank to your account.",
                      description:"Description for the topup page in the app" };
const etransfert = { id:"app.topup.tabs.etransfert",
                defaultMessage:"Interac E-mail Transfer",
                description:"Title for the tabs the topup page in the app" };
const interact = { id:"app.topup.tabs.interact",
                defaultMessage:"Interac Online",
                description:"Title for the tabs the topup page in the app" };

export const Topup = (routerProps:AccountPageProps) => {
  const intl = useIntl();
  const activeAccount = useActiveAccount();
  const panes = [
    { menuItem: intl.formatMessage({...etransfert}), render: () => <AppContainerForTabs><Purchase signer={activeAccount!.signer!} /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...interact}), render: () => <AppContainerForTabs>Coming soon</AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <Grid className={ `x2spaceBefore x4spaceAfter` } >
        <Grid.Row>
          <Grid.Column width={2}>
            <img src={illustration} />
          </Grid.Column>
          <Grid.Column width={13}>
            <Header as="h5" className={ `appTitles` }>
                <FormattedMessage {...title} />
                <Header.Subheader>
                  <FormattedMessage  {...description} />
                </Header.Subheader>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Tab panes={panes} renderActiveOnly={true} className={ `x6spaceAfter` } />
      <AppContainerWithShadow>
        <RecentTransactions {...routerProps} />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}