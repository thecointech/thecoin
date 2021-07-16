import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import styles from '../styles.module.less';
import illustration from '../images/5_illustration.svg';
import background from '../images/full_background.svg';
import co2 from '../images/icon_5_1.svg';
import science from '../images/icon_5_2.svg';
import trees from '../images/icon_5_3.svg';
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

export const Underwater = () => {

  return (
    <React.Fragment>
      <img className={ `${styles.illustration} x4spaceBefore` } src={illustration} />
      <div id={styles.underwaterPart} className={ `${styles.landscape} x10spaceBefore` }>
        <div className={ `${styles.header} x22spaceBefore x8spaceAfter` }>
              <Header as='h2' id={ `x32spaceBefore` }>
                <FormattedMessage {...translations.title} />
                <Header.Subheader className={`x5spaceBefore`}>
                  <FormattedMessage {...translations.description} />
                </Header.Subheader>
              </Header>
          </div>
        <Grid className={styles.content} padded doubling stackable>
          <Grid.Row columns="3" >
            <Grid.Column>
                <img src={co2} />
                <Header as='h4'>
                  <FormattedMessage {...translations.differenceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.differenceDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.differenceLink} /></Link>
            </Grid.Column>

            <Grid.Column columns={3} >
                <img src={science} />
                <Header as='h4'>
                  <FormattedMessage {...translations.scienceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.scienceDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.scienceLink} /></Link>
            </Grid.Column>

            <Grid.Column columns={3} >
                <img src={trees} />
                <Header as='h4'>
                  <FormattedMessage {...translations.treesTitle} />
                </Header>
                <p>
                  <FormattedMessage {...translations.treesDescription} />
                </p>
                <Link to="/healthier"><FormattedMessage {...translations.treesLink} /></Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <img className={styles.water} src={background} />
        <img src={illustrationDeco} className={styles.illustrationDeco}/>
      </div>
    </React.Fragment>
  );
}

