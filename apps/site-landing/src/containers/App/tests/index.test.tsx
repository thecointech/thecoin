import React from 'react';
import { jest } from '@jest/globals';
import rtr from 'react-test-renderer/shallow';

const renderer = rtr.createRenderer();

// Mock redux hooks
jest.unstable_mockModule('redux-injectors', () => ({
  useInjectSaga: jest.fn(),
  useInjectReducer: jest.fn(),
}));
// This import can trigger a compilation of the entire app
// (with numerous side-effects) so we skip it entirely
// NOTE: It only adds about 5 seconds to testing, should we keep it?
jest.unstable_mockModule('../Routes', () => ({
  Routes: () => <div>Router</div>
}));


const { App } = await import('../index');

describe('<App />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<App />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
