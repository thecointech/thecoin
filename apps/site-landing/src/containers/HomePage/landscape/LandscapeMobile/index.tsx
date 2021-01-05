import * as React from 'react';
import { Button, Grid, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import { Stickers } from '../stickers';

import styles from '../styles.module.less';
import landscapeGreenPartMobile from '../images/illustration_header_mob.svg';


export const LandscapeMobile = (Props: { mainTitle: React.ReactNode; mainDescription: React.ReactNode; }) => {
  return (
    <div className={styles.landscapeContent} >
      <Grid padded doubling stackable className={ `x8spaceBefore` }>
        <Grid.Row >
          <Grid.Column id={styles.headingWrapper}>
              <Header as="h1">
                {Props.mainTitle}
              </Header>
              <p>
                {Props.mainDescription}
              </p>
              <Button className={`${styles.overTheLandscape} x2spaceBefore` } as={NavLink} to="/Accounts" content='Start Now' primary size='large' />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Stickers Mobile={true} />
      <img className={styles.landscapeMobile} src={landscapeGreenPartMobile} />
    </div>
  );
}

