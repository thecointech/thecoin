import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { FormSubscribed } from './FormSubscribed/formSubscribed';

import illustration from './images/ill_subscription.svg'

const translations = defineMessages({
  aboveTheTitle : {
    defaultMessage: 'SUBSCRIPTION',
    description: 'site.subscribe.confirmation.aboveTheTitle: Text above the title for the \'Thank you for subscribing!\' page'},
  title : {
    defaultMessage: 'Thank you for subscribing!',
    description: 'site.subscribe.confirmation.title: Title for the \'Thank you for subscribing!\' page'},
  description : {
    defaultMessage: 'We would love to get to know you better!  Would you mind letting us know your details?',
    description: 'site.subscribe.confirmation.description: Descriton for the \'Thank you for subscribing!\' page'}
});

export const Confirm = () => {

  return (
    <>
        <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
          <Grid.Row>
            <Grid.Column>
                <Header as='h5'>
                  <FormattedMessage {...translations.aboveTheTitle}/>
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                  <FormattedMessage {...translations.title}/>
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <img src={illustration} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <FormattedMessage  {...translations.description}/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <FormSubscribed />
            </Grid.Column>
          </Grid.Row>
      </Grid>
    </>)
};
