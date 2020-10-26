import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header, Button } from 'semantic-ui-react';
import illustration from './images/illust_grow.svg';

import styles from './styles.module.css';
import { NavLink } from 'react-router-dom';

export const CreateAccountBanner = () => {
  return (
    <Grid className={styles.content} id={styles.createAccountBanner} columns='equal' textAlign='center' verticalAlign='middle' stackable>
        <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                    <FormattedMessage id="site.createAccountBanner.title"
                        defaultMessage="The benefits of a chequing, savings, and investing account all in one!"
                        description="The benefits of a chequing, savings, and investing account all in one!"/>
                </Header>
                <Button as={NavLink} to="/Accounts" content='' primary size='massive' >
                    <FormattedMessage id="site.createAccountBanner.button"
                        defaultMessage="Create Account"
                        description="Create Account button for the create account banner for interior pages"/>
                </Button>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column textAlign='left'>
                <img src={illustration} />
            </Grid.Column>
        </Grid.Row>
    </Grid>
  );
}
