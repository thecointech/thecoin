import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import styles from '../styles.module.less';
import illustration from '../images/5_illustration.svg';
import background from '../images/full_background.svg';
import co2 from '../images/icon_5_1.svg';
import science from '../images/icon_5_2.svg';
import trees from '../images/icon_5_3.svg';
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

export const Underwater = () => {

  return (
    <React.Fragment>
      <img className={ `${styles.illustration} x4spaceBefore` } src={illustration} />
      <div id={styles.underwaterPart} className={ `${styles.landscape} x10spaceBefore` }>
        <div className={ `${styles.header} x22spaceBefore x8spaceAfter` }>
              <Header as='h2' id={ `x32spaceBefore` }>
                <FormattedMessage {...title} />
              </Header>
              <p>
                <FormattedMessage {...description} />
              </p>
          </div>
        <Grid className={styles.content} padded doubling stackable>
          <Grid.Row columns="3" >
            <Grid.Column>
                <img src={co2} />
                <Header as='h4'>
                  <FormattedMessage {...differenceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...differenceDescription} />
                </p>
                <a href=""><FormattedMessage {...differenceLink} /></a>
            </Grid.Column>

            <Grid.Column columns={3} >
                <img src={science} />
                <Header as='h4'>
                  <FormattedMessage {...scienceTitle} />
                </Header>
                <p>
                  <FormattedMessage {...scienceDescription} />
                </p>
                <a href=""><FormattedMessage {...scienceLink} /></a>
            </Grid.Column>

            <Grid.Column columns={3} >
                <img src={trees} />
                <Header as='h4'>
                  <FormattedMessage {...treesTitle} />
                </Header>
                <p>
                  <FormattedMessage {...treesDescription} />
                </p>
                <a href=""><FormattedMessage {...treesLink} /></a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <img className={styles.water} src={background} />
        <img src={illustrationDeco} className={styles.illustrationDeco}/>
      </div>
    </React.Fragment>
  );
}

