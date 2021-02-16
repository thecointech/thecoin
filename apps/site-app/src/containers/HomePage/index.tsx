import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { RecentTransactions } from '@the-coin/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { HistoryGraph } from 'containers/HistoryGraph';

import * as React from 'react';


export const HomePage = (props: any, routerProps:AccountPageProps) => {

  return (
    <React.Fragment>
      <HistoryGraph />
      <AppContainerWithShadow><RecentTransactions {...props} {...routerProps} /></AppContainerWithShadow>
    </React.Fragment>
  );
}

