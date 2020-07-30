import * as React from 'react';
import { Grid, Button, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

export const CreateAccountSmall = () => {

  return (
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3'>
                <FormattedMessage id="site.homepage.createAccountSmall.title"
                      defaultMessage="TheCoin is a revolutionary new kind of account."
                      description="Title"
                      values={{ what: 'react-intl' }}/>
              </Header>
          </Grid.Column>  
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Button as={NavLink} to="/Accounts" content='Create Account' primary size='massive' />
          </Grid.Column>  
        </Grid.Row>
      </Grid>
  );
}

