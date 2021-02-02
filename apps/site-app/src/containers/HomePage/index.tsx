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
import { Balance } from '@the-coin/shared/containers/Balance';
import { BenefitsGraph } from 'containers/BenefitsGraph';

import * as React from 'react';
import { Header } from 'semantic-ui-react';
import styles from "./styles.module.less";


export const HomePage = (props: any, routerProps:AccountPageProps) => {

  return (
    <React.Fragment>
        <div>
          <BenefitsGraph />
          <div className={styles.recentOperations}>
            <Header as="h5">Recent Operations</Header>
              <Balance {...props} {...routerProps} />
          </div>
        </div>
    </React.Fragment>
  );
}

