import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import co2 from '../images/icon_5_1.svg';
import science from '../images/icon_5_2.svg';
import trees from '../images/icon_5_3.svg';
import backgroundMobile from '../images/full_background_mobile.svg';
import illustrationDeco from '../images/smallillustration_right.svg';

import { Grid, Header } from 'semantic-ui-react';


const title = { id:"site.homepage.underwater.title", 
                defaultMessage:"Earths’ Healthier",
                description:"Title for that homepage underwater part"};
const description = { id:"site.homepage.underwater.description", 
                      defaultMessage:"You can become CO2-neutral with TheCoin as we work to offset our clients’ emissions.",
                      description:"Title for the homepage underwater part"};

const differenceTitle = {  id:"site.homepage.underwater.difference.title", 
                      defaultMessage:"Make a Difference",
                      description:"Title for the homepage underwater difference subpart"};
const differenceDescription = {  id:"site.homepage.underwater.difference.description", 
                      defaultMessage:"Offsetting CO2 is effective. Extremely effective!",
                      description:"Description for the homepage underwater difference subpart"};
const differenceLink = {  id:"site.homepage.underwater.difference.link", 
                      defaultMessage:"Compare Outcomes",
                      description:"Link for the homepage underwater difference subpart"};

const scienceTitle = {  id:"site.homepage.underwater.science.title", 
                        defaultMessage:"Scientifically Verified",
                        description:"Title for the homepage underwater science subpart"};
const scienceDescription = {  id:"site.homepage.underwater.science.description", 
                              defaultMessage:"Prove it? We’d love to!",
                              description:"Description for the homepage underwater science subpart"};
const scienceLink = {   id:"site.homepage.underwater.science.link", 
                        defaultMessage:"Why We Can Be So Confident",
                        description:"Link for the homepage underwater science subpart"};

const treesTitle = {  id:"site.homepage.underwater.trees.title", 
                        defaultMessage:"We Do More",
                        description:"Title for the homepage underwater trees subpart"};
const treesDescription = {  id:"site.homepage.underwater.trees.description", 
                      defaultMessage:"It’s not just CO2. The projects we fund are vital to restoring our ecosystem.",
                      description:"Description for the homepage underwater trees subpart"};
const treesLink = {  id:"site.homepage.underwater.trees.link", 
                      defaultMessage:"What We Do",
                      description:"Link for the homepage underwater trees subpart"};


export const UnderwaterMobile = () => {

  return (
    <>
      <div id={sharedStyles.underwaterPart} className={styles.landscapeUnderwater}>
        <div className={ `${styles.header} x30spaceBefore` }>
              <Header as='h2' className={ `x1spaceAfter` }>
                <FormattedMessage {...title} />
                <Header.Subheader>
                  <FormattedMessage {...description} />
                </Header.Subheader>
              </Header>
          </div>
        <Grid className={ `${styles.content}` } padded doubling stackable textAlign="center">
          <Grid.Row columns="3" className={styles.mobileLine} >
            <Grid.Column>
                <img src={co2} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...differenceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...differenceDescription} />
                </p>
                <a href=""><FormattedMessage {...differenceLink} /></a>
            </Grid.Column>

            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={science} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...scienceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...scienceDescription} />
                </p>
                <a href=""><FormattedMessage {...scienceLink} /></a>
            </Grid.Column>

            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={trees} />
                <Header as='h4'className={ `x1spaceAfter` }>
                  <FormattedMessage {...treesTitle} />
                </Header>
                <p>
                  <FormattedMessage {...treesDescription} />
                </p>
                <a href=""><FormattedMessage {...treesLink} /></a>
            </Grid.Column>
          </Grid.Row>
        </Grid>

          <img className={styles.waterMobile} src={backgroundMobile} />
          <img src={illustrationDeco} className={ `${styles.illustrationDecoMobile}` }/>
      </div>
    </>
  );
}

