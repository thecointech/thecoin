import React from 'react';
import { Step, Icon, Button } from 'semantic-ui-react';
import { PageProps } from './PageProps';

export const CreatePasswordStep = (active?: boolean) => (
  <>
    <Icon name="key" />
    <Step.Content>
      <Step.Title>Passwords</Step.Title>
      <Step.Description>Securing your account</Step.Description>
    </Step.Content>
  </>
);

export const CreatePasswordPage = (props: PageProps) => 
<>
  <p>We need to talk about passwords</p>;
  <Button onClick={props.onComplete}>{props.buttonText}</Button>
</>
