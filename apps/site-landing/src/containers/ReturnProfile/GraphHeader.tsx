import React from 'react';
import { Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  header: {
    defaultMessage: 'Show me the Potential!',
  },
  subHeader: {
    defaultMessage: 'Over your lifetime, how much can you expect the value of your account grow?',
  },
});

export const GraphHeader = () => (
  <Header as="h1">
    <Header.Content>
      <FormattedMessage {...translations.header} />
    </Header.Content>
    <Header.Subheader>
      <FormattedMessage {...translations.subHeader} />
    </Header.Subheader>
  </Header>
  );