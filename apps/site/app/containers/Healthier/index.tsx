import { Media } from 'containers/App';
import * as React from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react';

import { CreateAccountBanner } from '../CreateAccountBanner';
import { HealthierMobile } from '../HealthierMobile';
import { ColumnWithTwoTitles } from './ColumnWithTwoTitles';
import illustration from './images/healthier-illustration.svg';

import styles from './styles.module.css';

export function Healthier() {
  let majorBanks = {  id:"site.healthier.majorbanks",
                      defaultMessage:"The major banks take an average of $1000 in profits each year from every Canadian.",
                      description:"The major banks take an average of $1000 in profits each year from every Canadian." }
  let investments = { id:"site.healthier.invest",
                      defaultMessage:"We invest our clients’ accounts and give them 90% of the profit.",
                      description:"We invest our clients’ accounts and give them 90% of the profit." }
  
  let lifestyle = {  id:"site.healthier.lifestyle",
                    defaultMessage:"It only costs about $100 per person to offset the CO2 for our current lifestyle.",
                    description:"It only costs about $100 per person to offset the CO2 for our current lifestyle." }
                                        
  let carbon = { id:"site.healthier.carbon",
                  defaultMessage:"The remaining 1/10th is used to pay off our carbon debt",
                  description:"The remaining 1/10th is used to pay off our carbon debt" }

  return (
    <>
      <div className={styles.wrapper} id={styles.healthier}>
        <Segment as={Media} greaterThan="mobile">
          <img src={illustration} className={styles.illustration} />
          <Grid className={styles.content} columns='equal' textAlign='left' verticalAlign='middle' stackable>
          <Header as="h1" className={styles.center}>
              Earth’s Healthier
          </Header>
            <p className={styles.center}>
              Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account.
            </p>
            <Grid.Row>
              <Grid.Column>
                <ColumnWithTwoTitles 
                  FirstTitle = "$1000"
                  FirstHeaderMessage = { majorBanks }
                  SecondTitle= "90%"
                  SecondHeaderMessage = { investments }/>
              </Grid.Column>
              <Grid.Column className={styles.rightColumn} textAlign='left'>
                <ColumnWithTwoTitles 
                    FirstTitle = "$100"
                    FirstHeaderMessage = { lifestyle }
                    SecondTitle= "1/10"
                    SecondHeaderMessage = { carbon }/>
                </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment as={Media} at="mobile">
          <HealthierMobile />
        </Segment>
      </div>

        <CreateAccountBanner />
      </>
  );
}
