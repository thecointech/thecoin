import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { ColumnWithTwoTitles } from '../ColumnWithTwoTitles';
import styles from './styles.module.css';
import illustrationLeft from './images/illust_graph_left.svg';
import illustrationRight from './images/illust_graph_right.svg';
import { FormattedMessage } from 'react-intl';

const styleLeft: React.CSSProperties = {
  float: 'left',
  left: '0px',
};

const styleRight: React.CSSProperties = {
  float: 'right',
  right: '0px',
};


export function HealthierMobile() {
  let majorBanks = {  id:"site.healthier.mobile.majorbanks",
                      defaultMessage:"The major banks take an average of $1000 in profits each year from every Canadian.",
                      description:"The major banks take an average of $1000 in profits each year from every Canadian." }
  let investments = { id:"site.healthier.mobile.invest",
                      defaultMessage:"We invest our clients’ accounts and give them 90% of the profit.",
                      description:"We invest our clients’ accounts and give them 90% of the profit." }
  
  let lifestyle = {  id:"site.healthier.mobile.lifestyle",
                    defaultMessage:"It only costs about $100 per person to offset the CO2 for our current lifestyle.",
                    description:"It only costs about $100 per person to offset the CO2 for our current lifestyle." }
                                        
  let carbon = { id:"site.healthier.mobile.carbon",
                  defaultMessage:"The remaining 1/10th is used to pay off our carbon debt",
                  description:"The remaining 1/10th is used to pay off our carbon debt" }
  return (
    <>
      <img src={illustrationRight} className={styles.illustrationRight} />
      <div className={styles.wrapper} id="healthier">
        <Grid id={styles.healthierContent} className={styles.content}  columns='equal' textAlign='left' verticalAlign='middle' stackable>
          <Header as="h1">
              <FormattedMessage 
                    id="site.healthier.mobile.title" 
                    defaultMessage="Earth’s Healthier"
                    description="Main title for the Earth’s Healthier page" />
          </Header>
          <p className={styles.center}>
            <FormattedMessage 
                  id="site.healthier.mobile.description" 
                  defaultMessage="Our non-profits mission is to fully use a neglected resource to fight climate change - your bank account."
                  description="Description underneath title for the We Do More mobile page" />
            
          </p>
          <Grid.Row>
            <Grid.Column textAlign='left'>
              <ColumnWithTwoTitles 
                FirstTitle = "$1000"
                FirstHeaderMessage = { majorBanks }
                SecondTitle= "90%"
                SecondHeaderMessage = { investments }
                CssForSeparator = { styleLeft } />
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <ColumnWithTwoTitles 
                  FirstTitle = "$100"
                  FirstHeaderMessage = { lifestyle }
                  SecondTitle= "1/10"
                  SecondHeaderMessage = { carbon }
                  CssForSeparator = { styleRight } />
              </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
      <img src={illustrationLeft} className={styles.illustrationLeft} />
    </>
  );
}
