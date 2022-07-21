import React from 'react';
import { jest } from '@jest/globals';
import { createRenderer } from 'react-test-renderer/shallow';

const renderer = createRenderer();

// Mock redux hooks
jest.mock('redux-injectors');
// This import can trigger a compilation of the entire app
// (with numerous side-effects) so we skip it entirely
jest.mock('../Routes', () => ({
  Routes: () => <div>Router</div>
}));

import { App } from '../index';

describe('<App />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<App />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
