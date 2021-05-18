import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { HistoryGraph } from 'containers/HistoryGraph';

import * as React from 'react';


export const HomePage = (routerProps: AccountPageProps) => {

  return (
    <React.Fragment>
      <HistoryGraph />
      <AppContainerWithShadow>
        <RecentTransactions {...routerProps} />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}
