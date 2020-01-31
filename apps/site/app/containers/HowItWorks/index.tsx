/**
 * How It Works
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import messages from './messages';
import check from './images/check.svg';
import exchange from './images/exchange.svg';
import moneyhand from './images/moneyhand.svg';
import save from './images/save.svg';
import user from './images/user.svg';

import styles from './styles.module.css';

export function HowItWorks() {
  return (
    <div className={styles.wrapper}>
      <Grid className={styles.center}>
        <Header as="h1">
          <Header.Content>
            <div className={styles.h1}>
              <FormattedMessage {...messages.header} />
            </div>
          </Header.Content>
          <Header.Subheader>
            <div className={styles.h2}>
              <FormattedMessage {...messages.subHeader} />
            </div>
          </Header.Subheader>
        </Header>

        <Grid.Row className={styles.center}>
          <Grid.Column width={1}>
            <p className={styles.list}>1.</p>
          </Grid.Column>
          <Grid.Column width={1}>
            <img className={styles.icons} src={user} />
          </Grid.Column>
          <Grid.Column width={8} className={styles.step1Wrap}>
            <div className={styles.step1}>
              <FormattedMessage {...messages.step1} />
            </div>
            <div className={styles.step1Sub}>
              <FormattedMessage {...messages.step1Sub} />
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row className={styles.center}>
          <Grid.Column width={1}>
            <p className={styles.list}>2.</p>
          </Grid.Column>
          <Grid.Column width={1}>
            <img className={styles.icons} src={save} />
          </Grid.Column>
          <Grid.Column width={8} className={styles.step1Wrap}>
            <div className={styles.step1}>
              <FormattedMessage {...messages.step2} />
            </div>
            <div className={styles.step1Sub}>
              <FormattedMessage {...messages.step2Sub} />
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row className={styles.center}>
          <Grid.Column width={1}>
            <p className={styles.list}>3.</p>
          </Grid.Column>
          <Grid.Column width={1}>
            <img className={styles.icons} src={exchange} />
          </Grid.Column>
          <Grid.Column width={8} className={styles.step1Wrap}>
            <div className={styles.step1}>
              <FormattedMessage {...messages.step3} />
            </div>
            <div className={styles.step1Sub}>
              <FormattedMessage {...messages.step3Sub} />
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row className={styles.center}>
          <Grid.Column width={1}>
            <p className={styles.list}>4.</p>
          </Grid.Column>
          <Grid.Column width={1}>
            <img className={styles.icons} src={check} />
          </Grid.Column>
          <Grid.Column width={8} className={styles.step1Wrap}>
            <div className={styles.step1}>
              <FormattedMessage {...messages.step4} />
            </div>
            <div className={styles.step1Sub}>
              <FormattedMessage {...messages.step4Sub} />
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row className={styles.center}>
          <Grid.Column width={1}>
            <p className={styles.list}>5.</p>
          </Grid.Column>
          <Grid.Column width={1}>
            <img className={styles.icons} src={moneyhand} />
          </Grid.Column>
          <Grid.Column width={8} className={styles.step1Wrap}>
            <div className={styles.step1}>
              <FormattedMessage {...messages.step5} />
            </div>
            <div className={styles.step1Sub}>
              <FormattedMessage {...messages.step5Sub} />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Grid verticalAlign="middle" className={styles.wrapper}></Grid>
    </div>
  );
}
