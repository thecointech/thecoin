import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom';

import styles from './index.module.css';
import sky from './images/sky.svg';
import landscapeSkyCloudsHigh from './images/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from './images/cloudsLeft.svg';
import landscapeSkyCloudsRight from './images/cloudsRight.svg';
import Sun from './images/sun.svg';
import SunAura from './images/sunAura.svg';
import landscapeGreenPart from './images/landscape.svg'


export const Landscape = () => {
  return (
    <React.Fragment>
      <Grid>
        <Grid.Row className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
            <div className={styles.headingWrapper}>
              <h1 className={styles.h1Home}>The future is brighter</h1>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3} className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
              <p>Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet.</p>
              <Button as={NavLink} to="/Accounts" content='Start Now' primary size='massive' id='knowMore' />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid stackable columns={2}>
          <Grid.Row columns={3}>
            <Grid.Column className={styles.card}>
              <h4>You’re Wealthier</h4>
              <p>Your money is always earning.  Make it earn for you.</p>
              <a href="">Learn More</a>
            </Grid.Column>
            <Grid.Column className={styles.card}>
              <h4>Earth’s Healthier</h4>
              <p>Be part of the solution. We offset our clients’ CO2</p>
              <a href="">Learn More</a>
            </Grid.Column>
          </Grid.Row>
      </Grid>
      <div className={styles.landscape}>
        <img className={styles.sky} src={sky} />
        <img className={styles.cloudsHigh} src={landscapeSkyCloudsHigh} />
        <img className={styles.cloudsLeft} src={landscapeSkyCloudsLeft} />
        <img className={styles.cloudsRight} src={landscapeSkyCloudsRight} />
        <img className={styles.sunAura} src={SunAura} />
        <img className={styles.sun} src={Sun} />
        <img className={styles.greenery} src={landscapeGreenPart} />
      </div>

    </React.Fragment>
  );
}

