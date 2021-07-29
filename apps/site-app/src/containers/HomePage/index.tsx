import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { HistoryGraph } from 'containers/HistoryGraph';

import * as React from 'react';


export const HomePage = () => {

  return (
    <React.Fragment>
      <ColumnRightTop />
      <HistoryGraph />
      <AppContainerWithShadow>
        <RecentTransactions />
      </AppContainerWithShadow>
      <ColumnRightBottom />
    </React.Fragment>
  );
}
