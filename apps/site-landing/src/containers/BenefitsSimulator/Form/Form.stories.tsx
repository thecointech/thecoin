import React, { useState } from 'react';
import { Story } from '@storybook/react';
import { Form as Component } from '.';
import { createParams } from '../../ReturnProfile/data';

export default {
  title: 'Landing/Benefits/Form',
  component: Component,
}

const defaultParams = createParams({initialBalance: 1000});
export const Form: Story = () => {
  const [params, setParams] = useState(defaultParams);
  const [years, setYears] = useState(10);
  return <Component params={params} setParams={setParams} years={years} setYears={setYears} />
}
