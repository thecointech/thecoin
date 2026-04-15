import React from 'react';
import { useParams } from 'react-router';
import { TestViewer } from '../components/TestViewer/TestViewer';
import { TestsReducer } from '../state/reducer';
import { Loader } from "semantic-ui-react"

export const TestViewerPage: React.FC = () => {
  const { key, element } = useParams<{ key: string; element: string }>();

  // Create a TestInfo object from the URL params
  const state = TestsReducer.useData();
  if (state.loading) {
    return <Loader active content="Loading..." />;
  }
  const test = state.tests.find(test => test.key === key && test.element === element);
  if (!test) {
    return <div>Test not found</div>;
  }

  return <TestViewer test={test} />;
};
