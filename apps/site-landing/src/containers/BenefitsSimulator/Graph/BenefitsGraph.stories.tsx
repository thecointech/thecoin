import React from 'react';
import { Meta } from '@storybook/react';
import { GraphCompare as Component } from '.';
import { getData } from '../../ReturnProfile/data/fetch.test';
import { createParams } from '../../ReturnProfile/data';

export default {
  title: 'Landing/Calculator/Graph',
  component: Component,
} as Meta;

const snpData = getData()
const params = createParams({initialBalance: 1000})
export const Graph = () => <Component snpData={snpData} params={params} />;
