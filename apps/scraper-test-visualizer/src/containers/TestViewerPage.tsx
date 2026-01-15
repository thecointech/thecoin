import React from 'react';
import { useParams } from 'react-router';
import { TestViewer } from '../components/TestViewer/TestViewer';
import { TestInfo } from '../testInfo';
import { TestsReducer } from '../state/reducer';

export const TestViewerPage: React.FC = () => {
  const { key, element } = useParams<{ key: string; element: string }>();

  // Create a TestInfo object from the URL params
  const state = TestsReducer.useData();
  const test = state.tests.find(test => test.key === key && test.element === element);
  if (!test) {
    return <div>Test not found</div>;
  }

  return <TestViewer test={test} />;
};
