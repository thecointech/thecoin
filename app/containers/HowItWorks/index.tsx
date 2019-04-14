/**
 * How It Works
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header, List } from 'semantic-ui-react';
import messages from './messages';

export function HowItWorks() {
  return (
    <Grid verticalAlign="middle">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
      <List bulleted relaxed>
        <List.Item>
			<List.Header><FormattedMessage {...messages.step1} /></List.Header>
          	<FormattedMessage {...messages.step1Sub} />
        </List.Item>
        <List.Item>
          <List.Header><FormattedMessage {...messages.step2} /></List.Header>
		  <FormattedMessage {...messages.step2Sub} />
        </List.Item>
        <List.Item>
          <List.Header><FormattedMessage {...messages.step3} /></List.Header>
		  <FormattedMessage {...messages.step3Sub} />
        </List.Item>
        <List.Item>
          <List.Header><FormattedMessage {...messages.step4} /></List.Header>
		  <FormattedMessage {...messages.step4Sub} />
        </List.Item>
        <List.Item>
          <List.Header><FormattedMessage {...messages.step5} /></List.Header>
		  <FormattedMessage {...messages.step5Sub} />
        </List.Item>
      </List>
    </Grid>
  );
}
