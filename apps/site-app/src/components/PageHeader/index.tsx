import * as React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

type VisualProps={
    illustration: string,
    title: MessageDescriptor,
    description: MessageDescriptor,
};

export const PageHeader = (props:VisualProps) => {
  return (
    <Grid className={ `x2spaceBefore x4spaceAfter` } >
        <Grid.Row>
          <Grid.Column width={2}>
            <img src={props.illustration} />
          </Grid.Column>
          <Grid.Column width={13}>
            <Header as="h5" className={ `appTitles` }>
                <FormattedMessage {...props.title} />
                <Header.Subheader>
                  <FormattedMessage {...props.description} />
                </Header.Subheader>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
  );
}