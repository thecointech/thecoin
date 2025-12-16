import React, { useState } from 'react';
import { StoryFn } from '@storybook/react-webpack5';
import { Form as Component } from '.';
import { createParams } from '../simulator';
import { action } from 'storybook/actions';
import { Props } from './types';

export default {
  title: 'Landing/Benefits/Form',
  component: Component,
}

const defaultParams = createParams({initialBalance: 1000});
export const Form: StoryFn = () => {
  const [params, setParams] = useState(defaultParams);
  const [years, setYears] = useState(10);
  const setParamAction = action('set-params');
  const setParamShim: Props["setParams"] = (v) => {
    (typeof v === 'function')
      ? setParamAction(v(params))
      : setParamAction(v);
    setParams(v)
  }
  const setYearsAction = action('set-years');
  const setYearsShim: Props["setYears"] = (v) => {
    setYearsAction(v);
    setYears(v);
  }
  return <Component params={params} setParams={setParamShim} years={years} setYears={setYearsShim} />
}
