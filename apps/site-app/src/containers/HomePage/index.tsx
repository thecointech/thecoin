import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { HistoryGraph } from 'containers/HistoryGraph';

import * as React from 'react';


export const HomePage = () => {
  return (
    <React.Fragment>
      <HistoryGraph />
      <AppContainerWithShadow>
        <RecentTransactions />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}
