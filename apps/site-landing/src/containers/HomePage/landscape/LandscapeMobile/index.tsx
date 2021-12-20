import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { Stickers } from '../stickers';

import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import {translations} from '../translations';
import { FormattedMessage } from 'react-intl';
import styles from '../styles.module.less';

export const LandscapeMobile = () => {
  return (
    <div className={styles.landscapeContent} >
      <Grid padded doubling stackable className={ `x8spaceBefore` }>
        <Grid.Row >
          <Grid.Column id={styles.headingWrapper}>
              <Header as="h1">
                <FormattedMessage {...translations.title} />
                <Header.Subheader>
                  <FormattedMessage {...translations.description} />
                </Header.Subheader>
              </Header>
              <ButtonPrimary className={`${styles.overTheLandscape} x2spaceBefore` } as="a" href={`${process.env.URL_SITE_APP}`} size='large'>
                <FormattedMessage {...translations.button} />
              </ButtonPrimary>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Stickers />
    </div>
  );
}

