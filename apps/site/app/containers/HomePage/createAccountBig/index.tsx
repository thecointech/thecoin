import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './index.module.css';
import { Grid, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import plants from "./images/illust_flowers.svg";

export const CreateAccountBig = () => {

  return (
    <>
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Row>
          <Grid.Column>
            <h3>
                <FormattedMessage id="site.homepage.createAccountBig.title"
                      defaultMessage="The benefits of a chequing, savings, and investing account all in one!"
                      description="Title"
                      values={{ what: 'react-intl' }}/></h3>
          </Grid.Column>  
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Button as={NavLink} to="/Accounts" content='Create Account' primary size='massive' />
          </Grid.Column>  
        </Grid.Row>
      </Grid>

      <img className={styles.plants} src={plants} />
    </>
  );
}
