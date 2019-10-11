import React from 'react';
import { Step, Icon } from 'semantic-ui-react';
import { Generate } from 'containers/Accounts/New/Generate';
import { PageProps } from './PageProps';

export const CreateAccountStep = () => (
  <>
    <Icon name="file" />
    <Step.Content>
      <Step.Title>Create</Step.Title>
      <Step.Description>Create a new account</Step.Description>
    </Step.Content>
  </>
);

export const CreateAccountPage = (props: PageProps) => {
  const onComplete = React.useCallback((name: string) => {
    props.setName(name);
    props.onComplete();
  }, []);

  return <Generate onComplete={onComplete} />;
};
