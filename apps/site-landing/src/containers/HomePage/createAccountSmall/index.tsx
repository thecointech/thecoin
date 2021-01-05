import * as React from 'react';
import { Grid, Button, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';


const title = { id:"site.homepage.createAccountSmall.title", 
                defaultMessage:"TheCoin is a revolutionary new kind of account.",
                description:"Title / content for the small create account banner"};
const button = {  id:"site.homepage.createAccountSmall.button", 
                  defaultMessage:"Create Account",
                  description:"Create Account button for the small create account banner for the home pages"};


export const CreateAccountSmall = () => {

  return (
      <Grid textAlign='center' verticalAlign='middle' padded className={ `${styles.content} x10spaceBefore x6spaceLeft` }>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3'>
                <FormattedMessage {...title} />
              </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Button as={NavLink} to="/addAccount" primary size='large' >
              <FormattedMessage {...button} />
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
  );
}

