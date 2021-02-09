/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */
//import { Redeem } from 'containers/Accounts/Redeem';
import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { RecentTransactions } from '@the-coin/shared/containers/RecentTransactions';
import { BillPayments } from 'containers/Accounts/BillPayments';
import { Redeem } from 'containers/Accounts/Redeem';
import { Transfer } from 'containers/Accounts/Transfer';
//import { Redeem } from 'containers/Accounts/Redeem';
import * as React from 'react';
import illustration from './images/icon_payment_big.svg';

import { Grid, Header, Tab } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';


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

export const MakePayments = (props: any, routerProps:AccountPageProps) => {
  const intl = useIntl();
  const account = props.account;
  const panes = [
    { menuItem: intl.formatMessage({...etransfert}), render: () => <div className={"appContainer topRightFlat"}><Redeem {...props} account={account} /></div> },
    { menuItem: intl.formatMessage({...bills}), render: () => <div className={"appContainer topRightFlat"}><BillPayments {...props} account={account} /></div> },
    { menuItem: intl.formatMessage({...anotherCoin}), render: () => <div className={"appContainer topRightFlat"}><Transfer {...props} account={account} /></div> },
    { menuItem: intl.formatMessage({...templates}), render: () => <div className={"appContainer topRightFlat"}>Templates</div> },
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
      <Tab panes={panes} renderActiveOnly={true}/>
      <RecentTransactions {...props} {...routerProps} />
    </React.Fragment>
  );
}

