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
import IconWithText from 'components/IconWithText/index';
import * as Icons from 'utils/icons';
import messages from './messages';
import { Link } from 'react-router-dom';
import { ContentSegment } from 'components/ContentSegment';
import { Teaser } from 'containers/ReturnProfile/Teaser';
import laptop from './images/laptop.svg';
import sprout from './images/sprout.svg';
import tree from './images/tree.svg';
import logoIcon from './images/logoIcon.svg';
import styles from './index.module.css';

export default class HomePage extends React.PureComponent {
  public render() {
    return (
      <React.Fragment>
        <Grid divided="vertically">
          <Grid.Row columns={3}>
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
              <div className={styles.bannerImgWrapper}>
                <img
                  className={styles.bannerImage}
                  alt="purchasing power of the dollar vs sp500"
                  src={tree}
                />
                <h3 className={styles.h3right}>
                  You get 90% of the dividends. <br />
                  We keep 10% and put it towards fighting
                  <br /> climate change: <span>Tree planting.</span>
                </h3>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <ContentSegment>
          <Container>
            <Teaser />
          </Container>
        </ContentSegment>

        <Grid divided="vertically" className={styles.topMargin}>
          <Grid.Row columns={3} centered>
            <Grid.Column className={styles.gridWrapper}>
              <IconWithText
                icon={Icons.ChartLine}
                message={messages.blurbGrow}
              />
              <Link className={styles.links} to="/howItWorks">
                LEARN MORE
              </Link>
            </Grid.Column>
            <Grid.Column className={styles.gridWrapper}>
              <IconWithText icon={Icons.Lock} message={messages.blurbFees} />
              <Link className={styles.links} to="/accounts">
                GO TO ACCOUNTS
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}
