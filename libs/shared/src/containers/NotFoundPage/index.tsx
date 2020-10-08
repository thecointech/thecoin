/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Header, Grid } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import illustration from './illust_pagenotfound.svg'

export function NotFoundPage() {
  return (
    <>
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
          <Grid.Row>
            <Grid.Column>
                <Header as='h5'>
                  <FormattedMessage id="site.NotFoundPage.aboveTheTitle"
                                  defaultMessage="PAGE NOT FOUND"
                                  description="Text above the title for the 404 page"/>
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                  <FormattedMessage id="site.NotFoundPage.title"
                                  defaultMessage="Sorry, we couldn’t find the page you are looking for"
                                  description="Title for the 404 page"/>
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Button as={NavLink} to="/" content='' primary size='massive' >
                    <FormattedMessage id="site.NotFoundPage.button"
                        defaultMessage="Home"
                        description="Go back to homepage button for the 404 page"/>
                </Button>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <img src={illustration} />
            </Grid.Column>
          </Grid.Row>
      </Grid>
    </>
  );
}
