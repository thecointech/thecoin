import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './index.module.css';
import { Grid, Button, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import plants from "./images/illust_flowers.svg";

export const CreateAccountBig = () => {

  return (
    <>
      <Grid textAlign='center' verticalAlign='middle' className={styles.content}>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3'>
                <FormattedMessage id="site.homepage.createAccountBig.title"
                      defaultMessage="The benefits of a chequing, savings, and investing account all in one!"
                      description="Title"
                      values={{ what: 'react-intl' }}/>
            </Header>
            <Button as={NavLink} to="/Accounts" content='Create Account' primary size='massive' />
          </Grid.Column>  
        </Grid.Row>
      </Grid>

      <img className={styles.plants} src={plants} />
    </>
  );
}
