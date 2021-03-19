import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';


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
            <ButtonPrimary as={NavLink} to={`${process.env.URL_SITE_APP}/addAccount`} size='large' >
              <FormattedMessage {...button} />
            </ButtonPrimary>
          </Grid.Column>
        </Grid.Row>
      </Grid>
  );
}

