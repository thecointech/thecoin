import React from 'react';
import { MemoryRouter } from 'react-router';

export const withRouter = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
)
