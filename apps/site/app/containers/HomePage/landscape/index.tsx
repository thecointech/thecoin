import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Stickers } from './stickers';

import styles from './styles.module.less';
import sky from './images/sky.svg';
import landscapeSkyCloudsHigh from './images/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from './images/cloudsLeft.svg';
import landscapeSkyCloudsRight from './images/cloudsRight.svg';
import Birds from './images/birds.svg';
import Sun from './images/sun.svg';
import SunAura from './images/sunAura.svg';
import landscapeGreenPart from './images/landscape.svg';
import landscapeGreenPartMobile from './images/illustration_header_mob.svg';
import { GreaterThanMobileSegment, MobileSegment } from 'components/ResponsiveTool';


export const Landscape = () => {
  return (
    <React.Fragment>
      <Grid padded doubling stackable>
        <Grid.Row className={styles.mainWrapper}>
          <Grid.Column id={styles.headingWrapper}>
              <h1 className={styles.h1Home}>
                <FormattedMessage id="site.homepage.landscape.title"
                      defaultMessage="The future is brighter"
                      description="The future is brighter"
                      values={{ what: 'react-intl' }}/>
              </h1>
              <p>
                  <FormattedMessage id="site.homepage.landscape.description"
                        defaultMessage="Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."
                        description="Description following the main title"
                        values={{ what: 'react-intl' }}/>
              </p>
              <Button as={NavLink} to="/addAccount" content='Start Now' primary size='massive' id={styles.knowMore} />
          </Grid.Column>
        </Grid.Row>
      </Grid>


      <GreaterThanMobileSegment>
        <Stickers Mobile={false} />
        <div className={styles.landscape}>
          <img className={styles.birds} src={Birds} />
          <img className={styles.sky} src={sky} />
          <img className={styles.cloudsHigh} src={landscapeSkyCloudsHigh} />
          <img className={styles.cloudsLeft} src={landscapeSkyCloudsLeft} />
          <img className={styles.cloudsRight} src={landscapeSkyCloudsRight} />
          <img className={styles.sunAura} src={SunAura} />
          <img className={styles.sun} src={Sun} />
          <img className={styles.greenery} src={landscapeGreenPart} />
        </div>
      </GreaterThanMobileSegment>

      <MobileSegment>
        <Stickers Mobile={true} />
        <img className={styles.landscapeMobile} src={landscapeGreenPartMobile} />
      </MobileSegment>

    </React.Fragment>
  );
}

