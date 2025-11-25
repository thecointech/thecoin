import * as React from 'react';

import { Routes, Route } from 'react-router';
import { Returns } from 'containers/ReturnProfile';
import { Healthier } from 'containers/Healthier';

export const Learn: React.FunctionComponent = () => {

  return (
    <Routes>
      <Route path={"calculator"} element={<Returns />} />
      <Route element={<Healthier />} />
    </Routes>
  );
};
