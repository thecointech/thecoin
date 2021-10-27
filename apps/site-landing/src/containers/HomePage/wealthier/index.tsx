import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import coffeePerson from './images/3_illustration.svg';
import startnow from './images/icon3_01.svg';
import investment from './images/icon3_02.svg';
import growth from './images/icon3_03.svg';
import profits from './images/icon3_04.svg';
import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
import { Link } from 'react-router-dom';

const translations = defineMessages({
  title : {
    defaultMessage: 'You’re Wealthier',
    description: 'site.homepage.wealthier.title: The title for the homepage wealthier'},
  description : {
    defaultMessage: 'Enjoy the benefits of investment growth on every dollar with our online spending account.',
    description: 'site.homepage.wealthier.description: The description for the homepage wealthier'},
  startnowTitle : {
    defaultMessage: 'Start Now',
    description: 'site.homepage.wealthier.startnow.title: The title for the star now for the homepage wealthier'},
  startnowDescription : {
    defaultMessage: 'The most important ingredient is time. You’re young - maximize your benefit!',
    description: 'site.homepage.wealthier.startnow.description: The description for the star now for the homepage wealthier'},
  startnowLink : {
    defaultMessage: 'Learn Your Edge',
    description: 'site.homepage.wealthier.startnow.link: The link for the star now for the homepage wealthier'},
  investmentTitle : {
    defaultMessage: 'The Best Investment',
    description: 'site.homepage.wealthier.investment.title: The title for the investment for the homepage wealthier'},
  investmentDescription : {
    defaultMessage: 'Why settle? Our time-tested strategy has the best long-term results.',
    description: 'site.homepage.wealthier.investment.description: The description for the investment for the homepage wealthier'},
  investmentLink : {
    defaultMessage: 'Compare Us',
    description: 'site.homepage.wealthier.investment.link: The link for the investment for the homepage wealthier'},
  growthTitle : {
    defaultMessage: 'Maximum Growth',
    description: 'site.homepage.wealthier.growth.title: The title for the growth for the homepage wealthier'},
  growthDescription : {
    defaultMessage: 'Add $250000 to your retirement - with no money down.',
    description: 'site.homepage.wealthier.growth.description: The title for the growth for the homepage wealthier'},
  growthLink : {
    defaultMessage: 'How Anyone Can Get Rich Slow',
    description: 'site.homepage.wealthier.growth.link: The link for the growth for the homepage wealthier'},
  profitsTitle : {
    defaultMessage: 'Keep Your Profits',
    description: 'site.homepage.wealthier.profits.title: The title for the profits for the homepage wealthier'},
  profitsDescription : {
    defaultMessage: 'Every dollar earns every day. As a non-profit, we want you to keep that benefit.',
    description: 'site.homepage.wealthier.profits.description: The description for the profits for the homepage wealthier'},
  profitsLink : {
    defaultMessage: 'Who Wins?',
    description: 'site.homepage.wealthier.profits.link: The link for the profits for the homepage wealthier'}
});

export const Wealthier = () => {

  return (
    <React.Fragment>
      <Grid stackable className={styles.content} padded>
        <Grid.Row columns={3}>
          <Grid.Column>
              <Header as='h2'>
                <FormattedMessage {...translations.title} />
                <Header.Subheader className={`x5spaceBefore`}>
                  <FormattedMessage {...translations.description} />
                </Header.Subheader>
              </Header>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={startnow} />
              <Header as='h4'>
                <FormattedMessage {...translations.startnowTitle} />
              </Header>
              <p>
                <FormattedMessage {...translations.startnowDescription} />
              </p>

              <Link to="/blog/start-now"><FormattedMessage {...translations.startnowLink} /></Link>
          </Grid.Column>

          <Grid.Column columns={3}>
              <img src={investment} />
              <Header as='h4'>
                <FormattedMessage {...translations.investmentTitle} />
              </Header>
              <p>
                <FormattedMessage {...translations.investmentDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...translations.investmentLink} /></Link>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3}>

          <Grid.Column columns={3}>
            <GreaterThanMobileSegment>
                <img src={coffeePerson} className={styles.illustration} />
            </GreaterThanMobileSegment>
            <MobileSegment>
              <img src={coffeePerson} className={styles.illustrationMobile} />
            </MobileSegment>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={growth} />
              <Header as='h4'>
                <FormattedMessage {...translations.growthTitle} />
              </Header>
              <p>
                <FormattedMessage {...translations.growthDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...translations.growthLink} /></Link>
          </Grid.Column>

          <Grid.Column columns={3} >
              <img src={profits} />
              <Header as='h4'>
                <FormattedMessage {...translations.profitsTitle} />
              </Header>
              <p>
                <FormattedMessage {...translations.profitsDescription} />
              </p>
              <Link to="/compare"><FormattedMessage {...translations.profitsLink} /></Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
}

