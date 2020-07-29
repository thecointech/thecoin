import * as React from 'react';
import { FormattedMessage,FormattedHTMLMessage } from 'react-intl';

import styles from './index.module.css';
import illustration from './images/5_illustration.svg';
import background from './images/full_background.svg';
import co2 from './images/icon_5_1.svg';
import science from './images/icon_5_2.svg';
import trees from './images/icon_5_3.svg';

import { Grid } from 'semantic-ui-react';

export const Underwater = () => {

  return (
    <React.Fragment>
      <img className={styles.illustration} src={illustration} />
      <div className={styles.landscape}>
      <Grid centered textAlign='center'>
          <Grid.Row centered textAlign='center'>
            <Grid.Column>
              <h2>
                <FormattedMessage id="site.homepage.underwater.title"
                      defaultMessage="Earths’ Healthier"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
              </h2>
              <p>
                <FormattedMessage id="site.homepage.underwater.description"
                      defaultMessage="You can become CO2-neutral with TheCoin as we work to offset our clients’ emissions."
                      description="Description for that part"
                      values={{ what: 'react-intl' }}/>
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid className={styles.content}>
          <Grid.Row columns="3" >
            <Grid.Column>
                <img src={co2} />
                <h4>
                  <FormattedMessage id="site.homepage.underwater.difference.title"
                      defaultMessage="Make a Difference"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </h4>
                <p>
                  <FormattedHTMLMessage id="site.homepage.underwater.difference.description"
                      defaultMessage="Offsetting CO2 is effective.<br />Extremely effective!"
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
                <h4>
                  <FormattedMessage id="site.homepage.underwater.science.title"
                      defaultMessage="Scientifically Verified"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </h4>
                <p>
                  <FormattedHTMLMessage id="site.homepage.underwater.science.description"
                      defaultMessage="Prove it?<br />We’d love to!"
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
                <h4>
                  <FormattedMessage id="site.homepage.underwater.trees.title"
                      defaultMessage="We Do More"
                      description="Title for that part"
                      values={{ what: 'react-intl' }}/>
                </h4>
                <p>
                  <FormattedHTMLMessage id="site.homepage.underwater.trees.description"
                      defaultMessage="It’s not just CO2.<br />The projects we fund are vital to restoring our ecosystem."
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
        
        <img className={styles.water} src={background} />
      </div>
    </React.Fragment>
  );
}

