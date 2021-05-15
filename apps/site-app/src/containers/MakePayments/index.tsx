import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { BillPayments } from 'containers/Accounts/BillPayments';
import { Redeem } from 'containers/Accounts/Redeem';
import { Transfer } from 'containers/Accounts/Transfer';
import * as React from 'react';
import illustration from './images/icon_payment_big.svg';
import {AppContainerForTabs, AppContainerWithShadow} from 'components/AppContainers';

import { Tab } from 'semantic-ui-react';
import { useIntl } from 'react-intl';
import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { PageHeader } from 'components/PageHeader';


const title = { id:"app.makepayments.title",
                defaultMessage:"Make a payment",
                description:"Main title for the Make a payment page in the app" };
const description = { id:"app.makepayments.description",
                      defaultMessage:"You can email money to anyone with an interac e-Transfer, pay your bills or transfer directly to another account.",
                      description:"Description for the Make a payment page in the app" };
const etransfer = { id:"app.makepayments.tabs.etransfer",
                    defaultMessage:"e-Transfer",
                    description:"Title for the tabs the Make a payment page in the app" };
const bills = { id:"app.makepayments.tabs.bills",
                defaultMessage:"Bills",
                description:"Title for the tabs the Make a payment page in the app" };
const anotherCoin = { id:"app.makepayments.tabs.anotherCoin",
                      defaultMessage:"Coin Transfer",
                      description:"Title for the tabs the Make a payment page in the app" };
const templates = { id:"app.makepayments.tabs.templates",
                    defaultMessage:"Templates",
                    description:"Title for the tabs the Make a payment page in the app" };

export const MakePayments = (routerProps:AccountPageProps) => {
  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...etransfer}), render: () => <AppContainerForTabs><Redeem /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...bills}), render: () => <AppContainerForTabs><BillPayments /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...anotherCoin}), render: () => <AppContainerForTabs><Transfer /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...templates}), render: () => <AppContainerForTabs>Templates</AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <PageHeader 
          illustration={illustration}
          title={title}
          description= {description}
      />
      <Tab panes={panes} renderActiveOnly={true} className={ `x6spaceAfter` } />
      <AppContainerWithShadow id={`inAppContent`}>
        <RecentTransactions {...routerProps} />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}

