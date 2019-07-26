import React from 'react';
import { Step, Icon, Header, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './Intro.messages';
import { PageProps } from './index';

export const CreateIntroStep = (active?: boolean) => (
  <>
    <Icon name="exclamation circle" />
    <Step.Content>
      <Step.Title>Introduction</Step.Title>
      <Step.Description>Some important info</Step.Description>
    </Step.Content>
  </>
);

export const CreateIntroPage = (props: PageProps) => (
  <>
    <Header as="h1">
      <Header.Content>
        <FormattedMessage {...messages.header} />
      </Header.Content>
      <Header.Subheader>
        <FormattedMessage {...messages.subHeader} />
      </Header.Subheader>
    </Header>
    <p>
      <FormattedMessage {...messages.para1} />
    </p>
		<p>
      <FormattedMessage {...messages.para2} />
    </p>
		<p>
      <FormattedMessage {...messages.para3} />
    </p>
		<p>
      <FormattedMessage {...messages.para4} />
    </p>
    <Button onClick={props.onComplete}>{props.buttonText}</Button>
  </>
);
