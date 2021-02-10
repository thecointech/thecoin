import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { RecentTransactions } from '@the-coin/shared/containers/RecentTransactions';
import { BenefitsGraph } from 'containers/BenefitsGraph';

import * as React from 'react';


export const HomePage = (props: any, routerProps:AccountPageProps) => {

  return (
    <React.Fragment>
      <BenefitsGraph />
      <RecentTransactions {...props} {...routerProps} />
    </React.Fragment>
  );
}

