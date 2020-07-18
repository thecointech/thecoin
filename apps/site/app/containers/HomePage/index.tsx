/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom';

import { Subscribe } from '../Subscribe';
import styles from './index.module.css';
import landscapeSkyCloudsHigh from './images/1landscapeGreen/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from './images/1landscapeGreen/cloudsLeft.svg';
import landscapeSkyCloudsRight from './images/1landscapeGreen/cloudsRight.svg';
import landscapeGreenPart from './images/1landscapeGreen/landscape.svg'


export const HomePage = () => {

  return (
    <React.Fragment>
      <h1 className={styles.h1Home}>The future is brighter</h1>

      <Grid divided="vertically">
        <Grid.Row columns={2} id='homeZone' className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
            <div className={styles.headingWrapper}>
              
              <p>Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet.</p>
              <Button as={NavLink} to="/Accounts" content='Start Now' primary size='massive' id='knowMore' />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className={styles.landscape}>
        <img className={styles.cloudsHigh} src={landscapeSkyCloudsHigh} />
        <img className={styles.cloudsLeft} src={landscapeSkyCloudsLeft} />
        <img className={styles.cloudsRight} src={landscapeSkyCloudsRight} />
        <img className={styles.greenery} src={landscapeGreenPart} />
      </div>

      <Subscribe />
    </React.Fragment>
  );
}

