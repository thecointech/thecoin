import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { BillPayments } from 'containers/Accounts/BillPayments';
import { Redeem } from 'containers/Accounts/Redeem';
import { Transfer } from 'containers/Accounts/Transfer';
import * as React from 'react';
import illustration from './images/icon_payment_big.svg';
import {AppContainerForTabs, AppContainerWithShadow} from 'components/AppContainers';

import { Grid, Header, Tab } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AccountPageProps } from '@thecointech/shared/containers/Account/types';


const title = { id:"app.makepayments.title",
                defaultMessage:"Make a payment",
                description:"Main title for the Make a payment page in the app" };
const description = { id:"app.makepayments.description",
                      defaultMessage:"You can email money to anyone with an interac e-Transfer, pay your bills or transfer directly to another account.",
                      description:"Description for the Make a payment page in the app" };
const etransfert = { id:"app.makepayments.tabs.etransfert",
                defaultMessage:"e-Transfert",
                description:"Title for the tabs the Make a payment page in the app" };
const bills = { id:"app.makepayments.tabs.bills",
                defaultMessage:"Bills",
                description:"Title for the tabs the Make a payment page in the app" };
const anotherCoin = { id:"app.makepayments.tabs.anotherCoin",
                defaultMessage:"Another Coin Account",
                description:"Title for the tabs the Make a payment page in the app" };
const templates = { id:"app.makepayments.tabs.templates",
                defaultMessage:"Templates",
                description:"Title for the tabs the Make a payment page in the app" };

export const MakePayments = (routerProps:AccountPageProps) => {
  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...etransfert}), render: () => <AppContainerForTabs><Redeem /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...bills}), render: () => <AppContainerForTabs><BillPayments /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...anotherCoin}), render: () => <AppContainerForTabs><Transfer /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...templates}), render: () => <AppContainerForTabs>Templates</AppContainerForTabs> },
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

