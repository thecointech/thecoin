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
import { Segment } from 'semantic-ui-react';
import { Media } from 'containers/App';

export const HomePage = () => {

  return (
    <React.Fragment>

      <Segment as={Media} greaterThan="mobile">
        <div>
          <Landscape />
          <Advantages />
          <Wealthier />
          <CreateAccountSmall />
          <Underwater />
          <CreateAccountBig />
        </div>
      </Segment>

      <Segment as={Media} at="mobile">
        <div id="mobile">
          <Landscape />
          <Advantages />
          <Wealthier />
          <CreateAccountSmall />
          <Underwater />
          <CreateAccountBig />
        </div>
      </Segment>

    </React.Fragment>
  );
}

