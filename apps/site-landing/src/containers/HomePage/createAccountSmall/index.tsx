import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import { CreateAccountButton } from 'components/AppLinks/CreateAccount';

const title = { id:"site.homepage.createAccountSmall.title",
                defaultMessage:"TheCoin is a revolutionary new kind of account.",
                description:"Title / content for the small create account banner"};

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
            <CreateAccountButton size="large" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
  );
}

