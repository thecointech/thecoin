/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Header, Grid, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import illustration from './illust_pagenotfound.svg'

const aboveTheTitle = { id:"shared.NotFoundPage.aboveTheTitle",
                        defaultMessage:"Page Not Found",
                        description:"Text above the title for the 404 page"};
const title = { id:"shared.NotFoundPage.title",
                defaultMessage:"Sorry, we couldn’t find the page you are looking for",
                description:"Title for the 404 page"};
const button = {  id:"shared.NotFoundPage.button",
                  defaultMessage:"Home",
                  description:"Go back to homepage button for the 404 page"};

export function NotFoundPage() {
  return (
    <>
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
          <Grid.Row>
            <Grid.Column>
                <Header as='h5'className={ `x8spaceBefore` }>
                  <FormattedMessage {...aboveTheTitle} />
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                  <FormattedMessage {...title} />
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Button primary as={NavLink} to="/" size='big' >
                    <FormattedMessage {...button} />
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
