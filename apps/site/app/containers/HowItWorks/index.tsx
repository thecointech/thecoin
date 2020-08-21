import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header, Responsive, Segment } from 'semantic-ui-react';

import { CreateAccountBanner } from '../CreateAccountBanner';

import styles from './styles.module.css';

export function HowItWorks() {
  return (
    <div className={styles.wrapper} id="healthier">
 

      <Responsive as={Segment} {...Responsive.onlyComputer}>
        <Grid className={styles.content} columns='equal' textAlign='left' verticalAlign='middle' stackable>
        <Header as="h1" className={styles.center}>
            Earth’s Healthier
        </Header>
          <p className={styles.center}>
            Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account.
          </p>
          <Grid.Row>
            <Grid.Column>
              <h2>$1000</h2>
              <FormattedMessage id="site.healthier.majorbanks"
                  defaultMessage="The major banks take an average of $1000 in profits each year from every Canadian."
                  description="The major banks take an average of $1000 in profits each year from every Canadian."/>
              <hr align="left" />
              <h2>90%</h2>
              <FormattedMessage id="site.healthier.invest"
                  defaultMessage="We invest our clients’ accounts and give them 90% of the profit."
                  description="We invest our clients’ accounts and give them 90% of the profit."/>
            </Grid.Column>

            <Grid.Column className={styles.rightColumn} textAlign='left'>
                <h2>$100</h2>
                <FormattedMessage id="site.healthier.lifestyle"
                    defaultMessage="It only costs about $100 per person to offset the CO2 for our current lifestyle."
                    description="It only costs about $100 per person to offset the CO2 for our current lifestyle."/>
                <hr align="left" />
                <h2>1/10</h2>
                <FormattedMessage id="site.healthier.carbon"
                    defaultMessage="The remaining 1/10th is used to pay off our carbon debt"
                    description="The remaining 1/10th is used to pay off our carbon debt"/>
              </Grid.Column>
          </Grid.Row>
        </Grid>
      </Responsive>


      <Responsive as={Segment} {...Responsive.onlyMobile}>
        <Grid className={styles.content} columns='equal' textAlign='left' verticalAlign='middle' stackable>
        <Header as="h1" className={styles.center}>
            Earth’s Healthier
        </Header>
          <p className={styles.center}>
            Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account.
          </p>
          <Grid.Row>
            <Grid.Column>
              <h2>$1000</h2>
              <FormattedMessage id="site.healthier.majorbanks"
                  defaultMessage="The major banks take an average of $1000 in profits each year from every Canadian."
                  description="The major banks take an average of $1000 in profits each year from every Canadian."/>
              <hr align="left" />
              <h2>90%</h2>
              <FormattedMessage id="site.healthier.invest"
                  defaultMessage="We invest our clients’ accounts and give them 90% of the profit."
                  description="We invest our clients’ accounts and give them 90% of the profit."/>
            </Grid.Column>

            <Grid.Column className={styles.rightColumn} textAlign='right'>
                <h2>$100</h2>
                <FormattedMessage id="site.healthier.lifestyle"
                    defaultMessage="It only costs about $100 per person to offset the CO2 for our current lifestyle."
                    description="It only costs about $100 per person to offset the CO2 for our current lifestyle."/>
                <hr align="right" />
                <h2>1/10</h2>
                <FormattedMessage id="site.healthier.carbon"
                    defaultMessage="The remaining 1/10th is used to pay off our carbon debt"
                    description="The remaining 1/10th is used to pay off our carbon debt"/>
              </Grid.Column>
          </Grid.Row>
        </Grid>
      </Responsive>


        <CreateAccountBanner />
    </div>
  );
}
