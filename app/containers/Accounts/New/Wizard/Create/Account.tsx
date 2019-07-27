import React from 'react';
import { Step, Icon } from 'semantic-ui-react';
import { Generate } from 'containers/Accounts/New/Generate';
import { PageProps } from './PageProps';

export const CreateAccountStep = () => (
  <>
    <Icon name="credit card" />
    <Step.Content>
      <Step.Title>Create</Step.Title>
      <Step.Description>Create a new account</Step.Description>
    </Step.Content>
  </>
);

export const CreateAccountPage = (props: PageProps) => 
  <Generate onComplete={(name: string) => {
    props.setName(name);
    props.onComplete();
  }} />;
