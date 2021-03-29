import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import { Stickers } from '../stickers';

import styles from '../styles.module.less';
import sky from '../images/sky.svg';
import landscapeSkyCloudsHigh from '../images/cloudsBackgroundHigh.svg';
import landscapeSkyCloudsLeft from '../images/cloudsLeft.svg';
import landscapeSkyCloudsRight from '../images/cloudsRight.svg';
import Birds from '../images/birds.svg';
import Sun from '../images/sun.svg';
import SunAura from '../images/sunAura.svg';
import landscapeGreenPart from '../images/landscape.svg';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';


export const LandscapeGreaterThanMobile = ( Props: { mainTitle: React.ReactNode; mainDescription: React.ReactNode; mainButton: React.ReactNode;  } ) => {
  return (
    <div className={styles.landscapeContent}>
      <Grid padded doubling stackable>
        <Grid.Row className="x4spaceBefore x6spaceAfter">
          <Grid.Column id={styles.headingWrapper}>
              <Header as="h1">
                {Props.mainTitle}
                <Header.Subheader>
                  {Props.mainDescription}
                </Header.Subheader>
              </Header>
              <ButtonPrimary className={`${styles.overTheLandscape} x6spaceBefore` } as={NavLink} to="/Accounts" size='large'>
                {Props.mainButton}
              </ButtonPrimary>
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
      </div>
  );
}

