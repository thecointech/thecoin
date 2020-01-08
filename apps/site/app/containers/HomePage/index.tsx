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
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import phone from './images/phoneAndMoney.svg';
import interac from './images/interacLogo.svg';
import treeLogo from './images/treeCanadaLogo.png';

import Subscribe from '../Subscribe';
import styles from '../../styles/base.css';
import { hasAccount } from 'utils/detection';
import { useSelector } from 'react-redux';
import { selectAccounts } from '@the-coin/shared/containers/Account/selector';

export const HomePage = () => {
  //const multicodec = require('multicodec');
  //const Box = require('3box');
  //const IdentityWallet = require('identity-wallet')

  const accounts = useSelector(selectAccounts);
  const userHasAccount = hasAccount(accounts);
  const accountButtonText = userHasAccount ? "My Accounts" : "Try It";
  return (
    <React.Fragment>
      <h2 className={styles.h2Home}>
        Our Socially Responsible, Self-Service Investment Account
      </h2>
      <Grid divided="vertically">
        <Grid.Row columns={2} id='homeZone' className={styles.mainWrapper}>
          <Grid.Column id='infosZone'>
            <div className={styles.headingWrapper}>
              <ol className={styles.listHome}>
                <li>Transfer and Pay with &nbsp;&nbsp;
                  <img
                    className={styles.interac}
                    alt="interac"
                    src={interac}
                  /></li>
                <li>Grow your money (average <b>Growth of 9.8%</b>) </li>
                <li>Pay <b>No Bank Fees</b></li>
                <li><b>We plant trees with    </b>
                  <img
                    className={styles.treeLogo}
                    alt="tree Canada Logo"
                    src={treeLogo}
                  /></li>
              </ol>
              <p>No engagement, no obligations.</p>

              <Button as={ NavLink } to="/howItWorks" content='More Infos' primary size='massive' id='knowMore'/>
              <Button as={ NavLink } to={"/accounts"} content={accountButtonText} secondary size='massive' id='createAccount'/>
            </div>
          </Grid.Column>
          <Grid.Column className={styles.phoneApp} id='phoneZone'>
            <img
                alt="mobile interac"
                src={phone}
              />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid divided="vertically">
        <Grid.Row columns={1}>
          <Grid.Column>
          <div className={styles.subContainer}>
                <p className={styles.subscribeText}>
                  <FormattedMessage
                    {...messages.subscribe}
                    values={{
                      bold: <b>{messages.subscribe.description}</b>,
                    }}
                  />
                </p>
              </div>
            <div className={styles.sproutWrapper}>
              <Subscribe />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
}

