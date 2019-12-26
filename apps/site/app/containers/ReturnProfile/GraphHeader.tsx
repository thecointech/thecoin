import React from 'react';
import { Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

export const GraphHeader = () => (
  <Header as="h1">
    <Header.Content>
      <FormattedMessage {...messages.header} />
    </Header.Content>
    <Header.Subheader>
      <FormattedMessage {...messages.subHeader} />
    </Header.Subheader>
  </Header>
  );