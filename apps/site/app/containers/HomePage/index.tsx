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
import phone from './images/phoneAndMoney.svg';
import interac from './images/interacLogo.svg';

import { Subscribe } from '../Subscribe';
import styles from './index.module.css';
import { hasAccount } from '@the-coin/shared/utils/detection';
import { useAccounts } from '@the-coin/shared/containers/AccountMap';


export const HomePage = () => {
  //const multicodec = require('multicodec');
  //const Box = require('3box');
  //const IdentityWallet = require('identity-wallet')

  const accounts = useAccounts();
  const userHasAccount = hasAccount(accounts);
  const accountButtonText = userHasAccount ? "My Accounts" : "Get Started";
  return (
    <React.Fragment>
      <h2 className={styles.h2Home}>
        Our Socially Responsible, Self-Service Investment Account
      </h2>
      <Grid divided="vertically">
        <Grid.Row columns={2} id='homeZone' className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
            <div className={styles.headingWrapper}>
              <ol className={styles.listHome}>
                <li>Transfer and Pay with &nbsp;&nbsp;
                  <img
                    className={styles.interac}
                    alt="interac"
                    src={interac}
                  /></li>
                <li>Grow your money (average <b>rate of 9.8%</b>) </li>
                <li>Pay <b>No Bank Fees</b></li>
              </ol>
              <p>No engagement, no obligations.</p>

              <Button as={NavLink} to="/howItWorks" content='More Info' primary size='massive' id='knowMore' />
              <Button as={NavLink} to={"/accounts"} content={accountButtonText} secondary size='massive' id='createAccount' />
            </div>
          </Grid.Column>
          <Grid.Column className={styles.phoneApp} id={styles.phoneZone}>
            <img
              alt="mobile interac"
              src={phone}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Subscribe />
    </React.Fragment>
  );
}

