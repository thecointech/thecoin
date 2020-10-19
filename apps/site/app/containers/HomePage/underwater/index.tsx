import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.css';
import illustration from './images/5_illustration.svg';
import background from './images/full_background.svg';
import co2 from './images/icon_5_1.svg';
import science from './images/icon_5_2.svg';
import trees from './images/icon_5_3.svg';
import backgroundMobile from './images/full_background_mobile.svg';

import { Grid, Header, Responsive, Segment } from 'semantic-ui-react';

export const Underwater = () => {

  return (
    <React.Fragment>
      <Responsive as={Segment} {...Responsive.onlyComputer && Responsive.onlyTablet}>
        <img className={styles.illustration} src={illustration} />
      </Responsive>
      <div className={styles.landscape}>
        <div className={styles.header}>
              <Header as='h2'>
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
        <Grid className={styles.content} padded doubling stackable>
          <Grid.Row columns="3" >
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
            
            <Grid.Column columns={3} >
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

            <Grid.Column columns={3} >
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
        
        <Responsive as={Segment} {...Responsive.onlyComputer && Responsive.onlyTablet}>
          <img className={styles.water} src={background} />
        </Responsive>

        <Responsive as={Segment} {...Responsive.onlyMobile}>
          <img className={styles.waterMobile} src={backgroundMobile} />
        </Responsive>
      </div>
    </React.Fragment>
  );
}

