import * as React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Stickers } from './stickers';

import styles from './styles.module.css';
import sky from './images/sky.svg';
import landscapeSkyCloudsHigh from './images/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from './images/cloudsLeft.svg';
import landscapeSkyCloudsRight from './images/cloudsRight.svg';
import Sun from './images/sun.svg';
import SunAura from './images/sunAura.svg';
import landscapeGreenPart from './images/landscape.svg';
import landscapeGreenPartMobile from './images/illustration_header_mob.svg';
import { Media } from 'containers/ResponsiveTool'; 


export const Landscape = () => {
  return (
    <React.Fragment>
      <Grid padded doubling stackable>
        <Grid.Row className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
            <div className={styles.headingWrapper}>
              <h1 className={styles.h1Home}>
                <FormattedMessage id="site.homepage.landscape.title"
                      defaultMessage="The future is brighter"
                      description="The future is brighter"
                      values={{ what: 'react-intl' }}/>
              </h1>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3} className={styles.mainWrapper}>
          <Grid.Column id={styles.infosZone}>
              <p>
                  <FormattedMessage id="site.homepage.landscape.description"
                        defaultMessage="Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."
                        description="Description following the main title"
                        values={{ what: 'react-intl' }}/>
              </p>
              <Button as={NavLink} to="/Accounts" content='Start Now' primary size='massive' id='knowMore' />
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Stickers />

      <Segment as={Media} greaterThan="mobile">
        <div className={styles.landscape}>
          <img className={styles.sky} src={sky} />
          <img className={styles.cloudsHigh} src={landscapeSkyCloudsHigh} />
          <img className={styles.cloudsLeft} src={landscapeSkyCloudsLeft} />
          <img className={styles.cloudsRight} src={landscapeSkyCloudsRight} />
          <img className={styles.sunAura} src={SunAura} />
          <img className={styles.sun} src={Sun} />
          <img className={styles.greenery} src={landscapeGreenPart} />
        </div>
      </Segment>

      <Segment as={Media} at="mobile">
        <img className={styles.landscapeMobile} src={landscapeGreenPartMobile} />
      </Segment>

    </React.Fragment>
  );
}

