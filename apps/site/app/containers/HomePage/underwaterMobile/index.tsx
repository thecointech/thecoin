import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.css';
import co2 from './images/icon_5_1.svg';
import science from './images/icon_5_2.svg';
import trees from './images/icon_5_3.svg';
import backgroundMobile from './images/full_background_mobile.svg';
import illustrationDeco from './images/smallillustration_right.svg';


import { Grid, Header } from 'semantic-ui-react';

export const UnderwaterMobile = () => {

  return (
    <>
      <div className={styles.landscapeUnderwater}>
        <div className={styles.header}>
              <Header as='h2' id={styles.titleUnderwater}>
                <FormattedMessage id="site.homepage.underwater.title"
                      defaultMessage="Earths’ Healthier"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
              </Header>
              <p>
                <FormattedMessage id="site.homepage.underwater.description"
                      defaultMessage="You can become CO2-neutral with TheCoin as we work to offset our clients’ emissions."
                      description="Description for that part"
                      values={{ what: 'react-intl' }}/>
              </p>
          </div>
        <Grid className={styles.content} padded doubling stackable textAlign="center">
          <Grid.Row columns="3" className={styles.mobileLine} >
            <Grid.Column>
                <img src={co2} />
                <Header as='h4'>
                  <FormattedMessage id="site.homepage.underwater.difference.title"
                      defaultMessage="Make a Difference"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </Header>
                <p>
                  <FormattedMessage id="site.homepage.underwater.difference.description"
                      defaultMessage="Offsetting CO2 is effective. Extremely effective!"
                      description="Description for that part"
                      values={{ what: 'react-intl' }}/>
                </p>
                <a href="">
                  <FormattedMessage id="site.homepage.underwater.difference.link"
                      defaultMessage="Compare Outcomes"
                      description="Link name for that part"
                      values={{ what: 'react-intl' }}/>
                </a>
            </Grid.Column>
            
            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={science} />
                <Header as='h4'>
                  <FormattedMessage id="site.homepage.underwater.science.title"
                      defaultMessage="Scientifically Verified"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </Header>
                <p>
                  <FormattedMessage id="site.homepage.underwater.science.description"
                      defaultMessage="Prove it? We’d love to!"
                      description="Description for that part"
                      values={{ what: 'react-intl' }}/>
                </p>
                <a href="">
                  <FormattedMessage id="site.homepage.underwater.science.link"
                      defaultMessage="Why We Can Be So Confident"
                      description="Link name for that part"
                      values={{ what: 'react-intl' }}/>
                </a>
            </Grid.Column>

            <Grid.Column columns={3} className={styles.mobileLine} >
                <img src={trees} />
                <Header as='h4'>
                  <FormattedMessage id="site.homepage.underwater.trees.title"
                      defaultMessage="We Do More"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </Header>
                <p>
                  <FormattedMessage id="site.homepage.underwater.trees.description"
                      defaultMessage="It’s not just CO2. The projects we fund are vital to restoring our ecosystem."
                      description="Description for that part"
                      values={{ what: 'react-intl' }}/>
                </p>
                <a href="">
                  <FormattedMessage id="site.homepage.underwater.trees.link"
                      defaultMessage="What We Do"
                      description="Link name for that part"
                      values={{ what: 'react-intl' }}/>
                </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
         
          <img className={styles.waterMobile} src={backgroundMobile} />
          <img src={illustrationDeco} className={styles.illustrationDecoMobile}/>
      </div>
    </>
  );
}

