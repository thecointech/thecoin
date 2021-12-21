import * as React from 'react';
import styles from './styles.module.less';

import { Grid } from 'semantic-ui-react'
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  monthlyFees : {
      defaultMessage: 'Monthly Fees',
      description: 'site.homepage.advantages.monthlyFees: Monthly Fees'},
  minimum : {
      defaultMessage: 'Minimums',
      description: 'site.homepage.advantages.minimum: Minimums'},
  benefits : {
      defaultMessage: 'Your benefits',
      description: 'site.homepage.advantages.benefits: Your benefits'}
  });

export const Advantages = () => {

  return (
    <div id={styles.advantages} className={`x2spaceBefore`}>
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable id={styles.advantageContent}>
        <Grid.Row>
          <Grid.Column width={2}>
            <h2>0</h2><h4>%</h4><br />
            <FormattedMessage {...translations.monthlyFees} />
          </Grid.Column>
          <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
          <Grid.Column width={2}>
            <h2>0</h2><h4>%</h4><br />
            <FormattedMessage {...translations.minimum} />
          </Grid.Column>
          <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
          <Grid.Column width={3}>
            <h2>100</h2><h4>%</h4><br />
            <FormattedMessage {...translations.benefits} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

