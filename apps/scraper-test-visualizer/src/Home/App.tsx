import React from 'react';
import { Routes } from '../Routes';
import { TestsReducer } from '../state/reducer';
import { Initializer } from '../state/initializer';

const App: React.FC = () => {
  // Initialize Redux store for tests
  TestsReducer.useStore();

  return (
    <>
      <Routes />
      <Initializer />
    </>
  );
};

export default App;
