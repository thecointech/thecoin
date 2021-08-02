import * as React from 'react';
import illustration from './images/icon_topup_big.svg';
import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import {AppContainerForTabs, AppContainerWithShadow} from 'components/AppContainers';
import { Tab } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { Purchase } from 'containers/TopUp/Purchase';
import { PageHeader } from 'components/PageHeader';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';

const translations = defineMessages({
  title : {
      defaultMessage: 'Topup balance',
      description: 'app.topup.title: Main title for the topup page in the app'},
  description : {
      defaultMessage: 'Transfer funds from your Canadian bank to your account.',
      description: 'app.topup.description: Description for the topup page in the app'},
  etransfer : {
      defaultMessage: 'Interac E-mail Transfer',
      description: 'app.topup.tabs.etransfer: Title for the tabs the topup page in the app'},
  interact : {
      defaultMessage: 'Interac Online',
      description: 'app.topup.tabs.interact: Title for the tabs the topup page in the app'}
});

export const Topup = () => {
  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...translations.etransfer}), render: () => <AppContainerForTabs><Purchase /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.interact}), render: () => <AppContainerForTabs>Coming soon</AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <ColumnRightTop />
      <PageHeader
          illustration={illustration}
          title={translations.title}
          description= {translations.description}
      />
      <Tab panes={panes} renderActiveOnly={true} className={ `x6spaceAfter` } />
      <AppContainerWithShadow>
        <RecentTransactions />
      </AppContainerWithShadow>
      <ColumnRightBottom />
    </React.Fragment>
  );
}
