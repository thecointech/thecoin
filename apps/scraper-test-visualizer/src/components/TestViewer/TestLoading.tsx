import React from 'react';
import { Loader } from 'semantic-ui-react';

export const TestLoading: React.FC<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null;
  return (
    <Loader active inline="centered">Loading test results...</Loader>
  );
};
