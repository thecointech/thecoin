import React from 'react';
import { Step, Icon } from 'semantic-ui-react';
import { Generate } from 'containers/Accounts/New/Generate';

export const CreateAccountStep = () => (
  <>
    <Icon name="file" />
    <Step.Content>
      <Step.Title>Create</Step.Title>
      <Step.Description>Create a new account</Step.Description>
    </Step.Content>
  </>
);

export const CreateAccountPage = () => {
  const onComplete = React.useCallback((name: string) => {
  }, []);

  return <Generate onComplete={onComplete} />;
};
