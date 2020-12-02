import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { RouteComponentProps } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { FormSubscribed } from './FormSubscribed/formSubscribed';

import illustration from './images/ill_subscription.svg'

export const Confirm = (props: RouteComponentProps) => {

  return (
    <>
        <Grid columns='equal' textAlign='center' verticalAlign='middle' stackable >
          <Grid.Row>
            <Grid.Column>
                <Header as='h5'>
                  <FormattedMessage id="site.subscribe.confirmation.aboveTheTitle"
                                  defaultMessage="SUBSCRIPTION"
                                  description="Text above the title for the 'Thank you for subscribing!' page"/>
                </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
                <Header as='h3'>
                  <FormattedMessage id="site.subscribe.confirmation.title"
                                  defaultMessage="Thank you for subscribing!"
                                  description="Title for the 'Thank you for subscribing!' page"/>
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
              <FormattedMessage id="site.subscribe.confirmation.description"
                                  defaultMessage="We would love to get to know you better!  Would you mind letting us know your details?"
                                  description="Descriton for the 'Thank you for subscribing!' page"/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <FormSubscribed {...props} />
            </Grid.Column>
          </Grid.Row>
      </Grid>
    </>)
};
