import React from 'react';
import { Routes } from '../Routes';
import { Initializer } from '../state/initializer';

const App: React.FC = () => {
  return (
    <>
      <Initializer />
      <Routes />
    </>
  );
};

export default App;
