/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import image from './trottoir_barre.jpg';
import messages from './messages';
import { Grid, Image, Header } from 'semantic-ui-react';

export function UnderConstruction() {
  return (
    <Grid centered stretched verticalAlign="middle">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <Image bordered rounded src={image} alt='Under Construction' />
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
    </Grid>
  );
}
