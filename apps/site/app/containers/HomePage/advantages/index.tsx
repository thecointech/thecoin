import * as React from 'react';
import styles from './index.module.css';

import { Grid } from 'semantic-ui-react'
import { FormattedMessage } from 'react-intl';

export const Advantages = () => {

  return (
    <React.Fragment>
      <div className={styles.advantages}>
      
        <Grid columns='equal' textAlign='center' verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4>
            </Grid.Column>
            <Grid.Column width={1}><hr /></Grid.Column>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4>
            </Grid.Column>
            <Grid.Column width={1}><hr /></Grid.Column>
            <Grid.Column width={3}>
              <h2>100</h2><h4>%</h4>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns='equal' textAlign='center' verticalAlign='top'>
          <Grid.Row>
            <Grid.Column width={2}>
              <FormattedMessage id="site.homepage.advantages.monthlyFees"
                  defaultMessage="Monthly Fees"
                  description="Monthly Fees"
                  values={{ what: 'react-intl' }}/>
            </Grid.Column>
            <Grid.Column width={1}></Grid.Column>
            <Grid.Column width={2}>
              <FormattedMessage id="site.homepage.advantages.monthlyFees"
                  defaultMessage="Minimums"
                  description="Minimums"
                  values={{ what: 'react-intl' }}/>
            </Grid.Column>
            <Grid.Column width={1}></Grid.Column>
            <Grid.Column width={3}>
              <FormattedMessage id="site.homepage.advantages.benefits"
                  defaultMessage="Your benefits"
                  description="Your benefits"
                  values={{ what: 'react-intl' }}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>

       </div>
    </React.Fragment>
  );
}

