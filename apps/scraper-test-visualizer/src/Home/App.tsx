import React from 'react';
import { Initializer } from '../state/initializer';
import { Outlet } from 'react-router';

const App: React.FC = () => {
  return (
    <>
      <Initializer />
      <Outlet />
    </>
  );
};

export default App;
