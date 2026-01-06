/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Header, Grid, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router';
import illustration from './images/illust_pagenotfound.svg'

const translate = defineMessages({
  aboveTheTitle : {
    defaultMessage:"Page Not Found",
    description:"shared.NotFoundPage.aboveTheTitle: Text above the title for the 404 page"},
  title : {
    defaultMessage:"Sorry, we couldn’t find the page you are looking for",
    description:"shared.NotFoundPage.title: Title for the 404 page"},
  button : {
    defaultMessage:"Home",
    description:"shared.NotFoundPage.button: Go back to homepage button for the 404 page"}});

export function NotFoundPage() {
  return (
    <>
      <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
          <Grid.Row>
            <Grid.Column>
                <Header as='h5'className={ `x8spaceBefore` }>
                  <FormattedMessage {...translate.aboveTheTitle} />
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                  <FormattedMessage {...translate.title} />
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Button primary as={NavLink} to="/" size='big' >
                    <FormattedMessage {...translate.button} />
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
