import React from 'react';
import { Step, Icon, Button } from 'semantic-ui-react';
import { PageProps } from './index';

export const InstallMetamaskStep = () => (
	<>
    <Icon name="credit card" />
    <Step.Content>
      <Step.Title>Metamask</Step.Title>
      <Step.Description>Install Metamask</Step.Description>
    </Step.Content>
	</>
);

export const InstallMetamaskPage = (props: PageProps) => (
  <>
	<p>Install Metamask</p>
  <Button onClick={props.onComplete}>{props.buttonText}</Button>
  </>
)