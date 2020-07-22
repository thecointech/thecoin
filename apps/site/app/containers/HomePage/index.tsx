/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import * as React from 'react';

import { Landscape } from './landscape';
import { Advantages } from './advantages';
import { Wealthier } from './wealthier';
import { CreateAccountSmall } from './createAccountSmall';
import { Underwater } from './underwater';
import { CreateAccountBig } from './createAccountBig';
import { Subscribe } from '../Subscribe';

export const HomePage = () => {

  return (
    <React.Fragment>
      <Landscape />
      <Advantages />
      <Wealthier />
      <CreateAccountSmall />
      <Underwater />
      <CreateAccountBig />
      <Subscribe />
    </React.Fragment>
  );
}

