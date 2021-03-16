import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import { Stickers } from '../stickers';

import styles from '../styles.module.less';
import landscapeGreenPartMobile from '../images/illustration_header_mob.svg';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';


export const LandscapeMobile = (Props: { mainTitle: React.ReactNode; mainDescription: React.ReactNode; mainButton: React.ReactNode; }) => {
  return (
    <div className={styles.landscapeContent} >
      <Grid padded doubling stackable className={ `x8spaceBefore` }>
        <Grid.Row >
          <Grid.Column id={styles.headingWrapper}>
              <Header as="h1">
                {Props.mainTitle}
                <Header.Subheader>
                  {Props.mainDescription}
                </Header.Subheader>
              </Header>
              <ButtonPrimary className={`${styles.overTheLandscape} x2spaceBefore` } as={NavLink} to="/Accounts" size='large'>
                {Props.mainButton}
              </ButtonPrimary>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Stickers Mobile={true} />
      <img className={styles.landscapeMobile} src={landscapeGreenPartMobile} />
    </div>
  );
}

