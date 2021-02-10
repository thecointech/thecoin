/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */
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

