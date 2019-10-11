import React from 'react';
import { Step, Icon } from 'semantic-ui-react';
import { PageProps } from './PageProps';
import { Connect } from 'containers/Accounts/New/Connect';

export const ConnectWeb3Step = () => (
  <>
    <Icon name="plug" />
    <Step.Content>
      <Step.Title>Connect</Step.Title>
      <Step.Description>Connect to external wallet</Step.Description>
    </Step.Content>
  </>
);

export const ConnectWeb3Page = (props: PageProps) => <Connect />;
