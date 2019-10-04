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
import { Grid, Container } from 'semantic-ui-react';

import { Link } from 'react-router-dom';
import { ContentSegment } from 'components/ContentSegment';
import { Teaser } from 'containers/ReturnProfile/Teaser';
import laptop from './images/laptop.svg';
import sprout from './images/sprout.svg';
import tree from './images/tree.svg';
import logoIcon from './images/logoIcon.svg';
import Subscribe from '../Subscribe';
import styles from './index.module.css';

export default class HomePage extends React.PureComponent {
  public render() {
    return (
      <React.Fragment>
        <Grid divided="vertically">
          <Grid.Row columns={3} className={styles.mainWrapper}>
            <Grid.Column>
              <div className={styles.headingWrapper}>
                <img
                  className={styles.laptop}
                  alt="purchasing power of the dollar vs sp500"
                  src={laptop}
                />
                <h3 className={styles.h3left}>
                  TheCoin is backed by the S&P500.
                  <br />
                  Annual return of 9.8% over the last 90 years.
                  <br />
                  Fight inflation and maintain purchasing power.
                </h3>
                <Link className={styles.links} to="/howItWorks">
                  LEARN MORE
                </Link>
              </div>
            </Grid.Column>
            <Grid.Column>
              <div className={styles.sproutWrapper}>
                <img
                  className={styles.sprout}
                  alt="purchasing power of the dollar vs sp500"
                  src={sprout}
                />
                <img
                  className={styles.logoIcon}
                  alt="purchasing power of the dollar vs sp500"
                  src={logoIcon}
                />
                <h3 className={styles.centerh3}>
                  Creating an account with <span>TheCoin</span> <br />
                  WILL help stop climate change.
                </h3>
              </div>
            </Grid.Column>

            <Grid.Column>
              <img
                className={styles.tree}
                alt="purchasing power of the dollar vs sp500"
                src={tree}
              />
              <h3 className={styles.h3right}>
                You get 90% of the dividends. <br />
                We keep 10% and put it towards fighting
                <br /> climate change: <span>Tree planting.</span>
              </h3>
              <Link className={styles.links} to="/howItWorks">
                LEARN MORE
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid divided="vertically">
          <Grid.Row columns={1}>
            <Grid.Column>
              <div className={styles.sproutWrapper}>
                <Subscribe />
                <p className={styles.subscribeText}>
                  Subscribe to learn how you can help fight climate change with
                  TheCoin.
                  <br />
                  Subscribe to our mailing list today.
                </p>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <ContentSegment>
          <Container>
            <Teaser />
          </Container>
        </ContentSegment>
      </React.Fragment>
    );
  }
}
