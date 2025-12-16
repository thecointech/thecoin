import React from 'react';
import { Message } from 'semantic-ui-react';

export const TestError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return (
    <Message negative>
      <Message.Header>Error</Message.Header>
      <p>{error}</p>
    </Message>
  );
};
