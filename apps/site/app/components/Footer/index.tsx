import React from 'react';
import styles from './styles.module.css';
import { Subscribe } from '../../containers/Subscribe';
import { FormattedMessage } from 'react-intl';
import { Container, Grid } from 'semantic-ui-react';
import facebook from './images/facebook.svg';
import twitter from './images/twitter.svg';
import instagram from './images/instagram.svg';

export default () => (
  <Container id={styles.footerContainer}>
      <Subscribe />
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
        <Grid.Row>
          <Grid.Column>

            <FormattedMessage id="site.footer.registered"
                  defaultMessage="The Coin Collaborative Canada is a registered non-profit"
                  description="Registered Non profit phrase in footer"/>
          
          </Grid.Column>
          <Grid.Column>
            <img src={facebook} />
            <img src={twitter} />
            <img src={instagram} />

          </Grid.Column>
          <Grid.Column>
            © 
            <FormattedMessage id="site.footer.copyright"
                  defaultMessage="Copyright 2020. TheCoin. All Right Reserved."
                  description="Copyright phrase in footer"/>
          
          </Grid.Column>
        </Grid.Row>
      </Grid>
  </Container>
);
