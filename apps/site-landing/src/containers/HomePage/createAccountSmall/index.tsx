import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { defineMessage, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../../components/AppLinks/CreateAccount';

const title = defineMessage({
  defaultMessage: 'TheCoin is a revolutionary new kind of account.',
  description: 'site.homepage.createAccountSmall.title: Title / content for the small create account banner',
});

export const CreateAccountSmall = () => (
  <div className={styles.content}>
    <Header as='h3'>
      <FormattedMessage {...title} />
    </Header>
    <div className={styles.button}>
      <CreateAccountButton size="large" />
    </div>
  </div>
);

