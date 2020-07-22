import * as React from 'react';
import styles from './index.module.css';

import { Grid } from 'semantic-ui-react'

export const Advantages = () => {

  return (
    <React.Fragment>
      <div className={styles.advantages}>
      
      <Grid columns='equal' centered>
        <Grid.Row>
          <Grid.Column>
            <h2>0</h2><h4>%</h4>
          </Grid.Column>
          <Grid.Column>
            <h2>0</h2><h4>%</h4>
          </Grid.Column>
          <Grid.Column>
            <h2>100</h2><h4>%</h4>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
              Monthly Fees
          </Grid.Column>
          <Grid.Column>
              Minimums
          </Grid.Column>
          <Grid.Column>
            Your benefits
          </Grid.Column>
        </Grid.Row>
      </Grid>

       </div>
    </React.Fragment>
  );
}

