/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import * as React from 'react';

import { Landscape } from './landscape';
import { Advantages } from './advantages';
import { Wealthier } from './wealthier';
import { CreateAccountSmall } from './createAccountSmall';
import { Underwater } from './underwater/UnderwaterGreaterThanMobile';
import { CreateAccountBanner, TypeCreateAccountBanner } from '../CreateAccountBanner';
import  styles from './styles.module.less';

export const HomePage = () => {
  return (
    <div className={styles.pageContainer}>
      <Landscape />
      <Advantages />
      <Wealthier />
      <CreateAccountSmall />
      <Underwater />
      <CreateAccountBanner className={styles.benefits} Type={TypeCreateAccountBanner.Plants} />
    </div>
  );
}

