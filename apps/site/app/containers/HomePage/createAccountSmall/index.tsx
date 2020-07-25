import * as React from 'react';
import { Grid, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

export const CreateAccountSmall = () => {

  return (
    <React.Fragment>
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Row>
          <Grid.Column>
            <h3>TheCoin is a revolutionary new kind of account.</h3>
          </Grid.Column>  
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Button as={NavLink} to="/Accounts" content='Create Account' primary size='massive' />
          </Grid.Column>  
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
}

