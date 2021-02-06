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

import { Header, Tab } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';


const title = { id:"app.makepayments.title",
                defaultMessage:"Make a payment",
                description:"Main title for the Make a payment page in the app" };
const description = { id:"app.makepayments.description",
                      defaultMessage:"You can email money to anyone with an interac e-Transfer, pay your bills or transfer directly to another account.",
                      description:"Description for the Make a payment page in the app" };

//<Redeem {...props} account={routerProps.account} />
export const MakePayments = (props: any, routerProps:AccountPageProps) => {
  const account = props.account;
  const panes = [
    { menuItem: 'e-Transfert', render: () => <div className={"appContainer"}><Redeem {...props} account={account} /></div> },
    { menuItem: 'Bills', render: () => <div className={"appContainer"}><BillPayments {...props} account={account} /></div> },
    { menuItem: 'Another Coin Account', render: () => <div className={"appContainer"}><Transfer {...props} account={account} /></div> },
    { menuItem: 'Templates', render: () => <div className={"appContainer"}>Templates</div> },
  ]
  return (
    <React.Fragment>
      <img src={illustration} />
      <Header as="h5" className={ `appTitles` }>
          <FormattedMessage {...title} />
          <Header.Subheader>
            <FormattedMessage  {...description} />
          </Header.Subheader>
      </Header>
      <Tab panes={panes} renderActiveOnly={true}/>
      <RecentTransactions {...props} {...routerProps} />
    </React.Fragment>
  );
}

