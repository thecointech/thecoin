import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import co2 from '../images/icon_5_1.svg';
import science from '../images/icon_5_2.svg';
import trees from '../images/icon_5_3.svg';
import backgroundMobile from '../images/full_background_mobile.svg';
import illustrationDeco from '../images/smallillustration_right.svg';

import { Grid, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';


const translations = defineMessages({
  title : {
    defaultMessage: 'Earths’ Healthier',
    description: 'site.homepage.underwater.title: Title for that homepage underwater part'},
  description : {
    defaultMessage: 'You can become CO2-neutral with TheCoin as we work to offset our clients’ emissions.',
    description: 'site.homepage.underwater.description: Description for the homepage underwater part'},
  differenceTitle : {
    defaultMessage: 'Make a Difference',
    description: 'site.homepage.underwater.difference.title: Title for the homepage underwater difference subpart'},
  differenceDescription : {
    defaultMessage: 'Offsetting CO2 is effective. Extremely effective!',
    description: 'site.homepage.underwater.difference.description: Description for the homepage underwater difference subpart'},
  differenceLink : {
    defaultMessage: 'Compare Outcomes',
    description: 'site.homepage.underwater.difference.link: Link for the homepage underwater difference subpart'},
  scienceTitle : {
    defaultMessage: 'Scientifically Verified',
    description: 'site.homepage.underwater.science.title: Title for the homepage underwater science subpart'},
  scienceDescription : {
    defaultMessage: 'Prove it? We’d love to!',
    description: 'site.homepage.underwater.science.description: Description for the homepage underwater science subpart'},
  scienceLink : {
    defaultMessage: 'Why We Can Be So Confident',
    description: 'site.homepage.underwater.science.link: Link for the homepage underwater science subpart'},
  treesTitle : {
    defaultMessage: 'We Do More',
    description: 'site.homepage.underwater.trees.title: Title for the homepage underwater trees subpart'},
  treesDescription : {
    defaultMessage: 'It’s not just CO2. The projects we fund are vital to restoring our ecosystem.',
    description: 'site.homepage.underwater.trees.description: Description for the homepage underwater trees subpart'},
  treesLink : {
    defaultMessage: 'What We Do',
    description: 'site.homepage.underwater.trees.link: Link for the homepage underwater trees subpart'}
});

export const UnderwaterMobile = () => {

  return (
    <>
      <div className={styles.background}>
        <div className={ `${styles.header} x30spaceBefore` }>
              <Header as='h2' className={ `x1spaceAfter` }>
                <FormattedMessage {...translations.title} />
                <Header.Subheader>
                  <FormattedMessage {...translations.description} />
                </Header.Subheader>
              </Header>
          </div>
        <Grid className={ `${styles.content}` } padded doubling stackable textAlign="center">
          <Grid.Row columns="3" className={styles.mobileLine} >
            <Grid.Column>
                <img src={co2} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...translations.differenceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.differenceDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.differenceLink} /></Link>
            </Grid.Column>

            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={science} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...translations.scienceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.scienceDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.scienceLink} /></Link>
            </Grid.Column>

            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={trees} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...translations.treesTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.treesDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.treesLink} /></Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>

          <img className={styles.waterMobile} src={backgroundMobile} />
          <img src={illustrationDeco} className={ `${styles.illustrationDecoMobile}` }/>
      </div>
    </>
  );
}

