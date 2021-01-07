import React from 'react';

import styles from './styles.module.less';

import { Subscribe } from '../../containers/Subscribe';
import { FormattedMessage } from 'react-intl';
import { Grid } from 'semantic-ui-react';

import facebook from './images/facebook.svg';
import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';


const registered = {  id:"site.footer.registered",
                      defaultMessage:"The Coin Collaborative Canada is a registered non-profit",
                      description:"Registered Non profit phrase in footer"};

const copyright = {   id:"site.footer.copyright",
                      defaultMessage:"Copyright 2020. TheCoin. All Right Reserved.",
                      description:"Copyright phrase in footer"};

export const Footer = () => (
  <div id={styles.footerContainer}>
      <Subscribe />
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable className={ `x5spaceBefore` }>
        <Grid.Row>
          <Grid.Column className={ styles.registered }>
            <FormattedMessage {...registered} />
          </Grid.Column>
          <Grid.Column>
            <img src={facebook} />
            <img src={twitter} />
            <img src={instagram} />
          </Grid.Column>
          <Grid.Column className={ styles.copyright }>
            &#169; &nbsp;<FormattedMessage {...copyright} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
  </div>
);
