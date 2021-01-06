import * as React from 'react';
import styles from './styles.module.less';

import { Grid } from 'semantic-ui-react'
import { FormattedMessage } from 'react-intl';


const monthlyFees = { id:"site.homepage.advantages.monthlyFees", 
                defaultMessage:"Monthly Fees",
                description:"Monthly Fees"};
const minimum = { id:"site.homepage.advantages.minimum", 
                  defaultMessage:"Minimums",
                  description:"Minimums"};
const benefits = { id:"site.homepage.advantages.benefits", 
                  defaultMessage:"Your benefits",
                  description:"Your benefits"};


export const Advantages = () => {

  return (
    <React.Fragment>
      <div id={styles.advantages} className={ `x2spaceBefore` }>
        <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable id={styles.advantageContent}>
          <Grid.Row>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4><br />
              <FormattedMessage {...monthlyFees} />
            </Grid.Column>
            <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
            <Grid.Column width={2}>
              <h2>0</h2><h4>%</h4><br />
              <FormattedMessage {...minimum} />
            </Grid.Column>
            <Grid.Column width={1} only='computer tablet'><hr className={styles.advantagesLines} /></Grid.Column>
            <Grid.Column width={3}>
              <h2>100</h2><h4>%</h4><br />
              <FormattedMessage {...benefits} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
       </div>
    </React.Fragment>
  );
}

