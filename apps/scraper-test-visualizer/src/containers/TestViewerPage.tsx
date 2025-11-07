import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { TestViewer } from '../components/TestViewer/TestViewer';
import { TestInfo } from '../testInfo';

export const TestViewerPage: React.FC = () => {
  const { key, element } = useParams<{ key: string; element: string }>();

  // Create a TestInfo object from the URL params
  const test = new TestInfo({
    key: decodeURIComponent(key),
    element: decodeURIComponent(element),
  });

  return <TestViewer test={test} />;
};
