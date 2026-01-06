import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { BillPayments } from 'containers/Accounts/BillPayments';
import { Redeem } from 'containers/Accounts/Redeem';
import { Transfer } from 'containers/Accounts/Transfer';
import React, { useState } from 'react';
import illustration from './images/icon_payment_big.svg';
import {AppContainerForTabs, AppContainerWithShadow} from 'components/AppContainers';
import { Tab } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { PageHeader } from 'components/PageHeader';
import { DateTime } from 'luxon';

const translations = defineMessages({
  title : {
      defaultMessage: 'Make a payment',
      description: 'app.makepayments.title: Main title for the Make a payment page in the app'},
  description : {
      defaultMessage: 'You can email money to anyone with an interac e-Transfer, pay your bills or transfer directly to another account.',
      description: 'app.makepayments.description: Description for the Make a payment page in the app'},
  etransfer : {
      defaultMessage: 'e-Transfer',
      description: 'app.makepayments.tabs.etransfer: Title for the tabs the Make a payment page in the app'},
  bills : {
      defaultMessage: 'Bills',
      description: 'app.makepayments.tabs.bills: Title for the tabs the Make a payment page in the app'},
  anotherCoin : {
      defaultMessage: 'Coin Transfer',
      description: 'app.makepayments.tabs.anotherCoin: Title for the tabs the Make a payment page in the app'},
  templates : {
      defaultMessage: 'Templates',
      description: 'app.makepayments.tabs.templates: Title for the tabs the Make a payment page in the app'}
});

export const MakePayments = () => {

  const fromDate = useState(DateTime.now().minus({year: 1}));
  const toDate = useState(DateTime.now());

  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...translations.etransfer}), render: () => <AppContainerForTabs><Redeem /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.bills}), render: () => <AppContainerForTabs><BillPayments /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.anotherCoin}), render: () => <AppContainerForTabs><Transfer /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.templates}), render: () => <AppContainerForTabs>Templates</AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <PageHeader
          illustration={illustration}
          title={translations.title}
          description= {translations.description}
      />
      <Tab panes={panes} renderActiveOnly={true} className={ `x6spaceAfter` } />
      <AppContainerWithShadow>
        <RecentTransactions fromDate={fromDate} toDate={toDate} />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}

