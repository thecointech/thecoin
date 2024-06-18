import React, { useState } from 'react';
import { RecentTransactions } from '@thecointech/shared/containers/RecentTransactions';
import { AppContainerWithShadow } from 'components/AppContainers';
import { HistoryGraph } from 'containers/HistoryGraph';
import { DateTime } from 'luxon';

export const HomePage = () => {

  const fromDate = useState(DateTime.now().minus({years: 1}));
  const toDate = useState(DateTime.now());

  return (
    <React.Fragment>
      <HistoryGraph fromDate={fromDate} toDate={toDate} />
      <AppContainerWithShadow>
        <RecentTransactions fromDate={fromDate} toDate={toDate} />
      </AppContainerWithShadow>
    </React.Fragment>
  );
}
