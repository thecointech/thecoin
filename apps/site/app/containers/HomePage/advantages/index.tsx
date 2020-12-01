import * as React from 'react';
import styles from './styles.module.less';

import { Grid } from 'semantic-ui-react'
import { FormattedMessage } from 'react-intl';

export const Advantages = () => {

  return (
    <React.Fragment>
      <div id={styles.advantages}>
        <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable>
          <Grid.Row>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4><br />
              <FormattedMessage id="site.homepage.advantages.monthlyFees"
                  defaultMessage="Monthly Fees"
                  description="Monthly Fees"
               />
            </Grid.Column>
            <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4><br />
              <FormattedMessage id="site.homepage.advantages.minimum"
                  defaultMessage="Minimums"
                  description="Minimums"
              />
            </Grid.Column>
            <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
            <Grid.Column width={3}>
              <h2>100</h2><h4>%</h4><br />
              <FormattedMessage id="site.homepage.advantages.benefits"
                  defaultMessage="Your benefits"
                  description="Your benefits"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
       </div>
    </React.Fragment>
  );
}

