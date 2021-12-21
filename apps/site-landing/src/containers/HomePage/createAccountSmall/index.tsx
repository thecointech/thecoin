import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../../components/AppLinks/CreateAccount';

const translations = defineMessages({
  title : {
      defaultMessage: 'TheCoin is a revolutionary new kind of account.',
      description: 'site.homepage.createAccountSmall.title: Title / content for the small create account banner'}
  });

export const CreateAccountSmall = () => {

  return (
      <Grid textAlign='center' verticalAlign='middle' padded className={ `${styles.content}` }>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3'>
                <FormattedMessage {...translations.title} />
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

