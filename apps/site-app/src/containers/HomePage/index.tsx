import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { HistoryGraph } from 'containers/HistoryGraph';

import * as React from 'react';


export const HomePage = (routerProps: AccountPageProps) => {

  return (
    <React.Fragment>
      <ColumnRightTop />
      <HistoryGraph />
      <AppContainerWithShadow>
        <RecentTransactions {...routerProps} />
      </AppContainerWithShadow>
      <ColumnRightBottom />
    </React.Fragment>
  );
}
