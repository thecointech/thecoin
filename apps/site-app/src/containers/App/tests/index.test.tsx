import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';

const renderer = createRenderer();

// Mock the various API's we hook here
jest.mock('react-router', () => ({
  useLocation: () => { key: "TESTING"}
}));
jest.mock('@thecointech/shared/containers/AccountMap', () => ({
  useAccountMapStore: jest.fn(),
}));
jest.mock('@thecointech/shared/containers/FxRate/reducer', () => ({
  useFxRatesStore: jest.fn(),
}));
jest.mock('@thecointech/shared/containers/PageSidebar/reducer', () => ({
  useSidebar: jest.fn(),
}));

// This import can trigger a compilation of the entire app
// (with numerous side-effects) so we skip it entirely
jest.mock('../../MainRouter', () => ({
  MainRouter: () => <div>Router</div>
}));

import { App } from '../index';

describe('<App />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<App />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
