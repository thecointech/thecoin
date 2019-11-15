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
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { Teaser } from 'containers/ReturnProfile/Teaser';
//import tree from './images/tree.svg';
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
                <h3 className={styles.h3left}>
                  <FormattedMessage
                    {...messages.headerTopLeft}
                    values={{
                      bold: <b>{messages.headerTopLeft.description}</b>,
                    }}
                  />
                </h3>
                <Link className={styles.links} to="/howItWorks">
                  <FormattedMessage {...messages.learnMore} />
                </Link>
              </div>
            </Grid.Column>
            <Grid.Column>
              <div className={styles.sproutWrapper}>
                
                <h3 className={styles.centerh3}>
                  <FormattedMessage
                    {...messages.headerTopCenter}
                    values={{
                      bold: <b>{messages.headerTopCenter.description}</b>,
                    }}
                  />
                </h3>
              </div>
            </Grid.Column>

            <Grid.Column>
              <h3 className={styles.h3right}>
                <FormattedMessage
                  {...messages.headerTopRight}
                  values={{
                    bold: <b>{messages.headerTopRight.description}</b>,
                  }}
                />
              </h3>
              <Link className={styles.links} to="/howItWorks">
                <FormattedMessage {...messages.learnMore} />
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid divided="vertically">
          <Grid.Row columns={1}>
            <Grid.Column>
              <div className={styles.sproutWrapper}>
                <Subscribe />
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
