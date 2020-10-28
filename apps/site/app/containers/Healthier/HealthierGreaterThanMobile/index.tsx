import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { ColumnWithTwoTitles } from '../ColumnWithTwoTitles';
import styles from './styles.module.css';
import illustration from './images/healthier-illustration.svg';
import { FormattedMessage } from 'react-intl';

export function HealthierGreaterThanMobile() {
  const majorBanks = {  id:"site.healthier.majorbanks",
                      defaultMessage:"The major banks take an average of $1000 in profits each year from every Canadian.",
                      description:"The major banks take an average of $1000 in profits each year from every Canadian." }
  const investments = { id:"site.healthier.invest",
                      defaultMessage:"We invest our clients’ accounts and give them 90% of the profit.",
                      description:"We invest our clients’ accounts and give them 90% of the profit." }
  
  const lifestyle = {  id:"site.healthier.lifestyle",
                    defaultMessage:"It only costs about $100 per person to offset the CO2 for our current lifestyle.",
                    description:"It only costs about $100 per person to offset the CO2 for our current lifestyle." }
                                        
  const carbon = { id:"site.healthier.carbon",
                  defaultMessage:"The remaining 1/10th is used to pay off our carbon debt",
                  description:"The remaining 1/10th is used to pay off our carbon debt" }
  return (
    <>
      <img src={illustration} className={styles.illustration} />
      <Grid id={styles.healthierContent} className={styles.content} columns='equal' textAlign='left' verticalAlign='middle' stackable>
        <Header as="h1" className={styles.center}>
            <FormattedMessage 
                      id="site.healthier.title" 
                      defaultMessage="Earth’s Healthier"
                      description="Main title for the Earth’s Healthier page" />
        </Header>
        <p className={styles.center}>
        <FormattedMessage 
                  id="site.healthier.description" 
                  defaultMessage="Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account."
                  description="Description underneath title for the We Do More mobile page" />
        </p>
        <Grid.Row>
          <Grid.Column>
            <ColumnWithTwoTitles 
              FirstTitle = "$1000"
              FirstHeaderMessage = { majorBanks }
              SecondTitle= "90%"
              SecondHeaderMessage = { investments }
              CssForSeparator = { undefined } />
          </Grid.Column>
          <Grid.Column className={styles.rightColumn} textAlign='left'>
            <ColumnWithTwoTitles 
                FirstTitle = "$100"
                FirstHeaderMessage = { lifestyle }
                SecondTitle= "1/10"
                SecondHeaderMessage = { carbon }
                CssForSeparator = { undefined }/>
            </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}
