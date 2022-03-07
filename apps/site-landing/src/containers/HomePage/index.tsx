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
import { Healthier } from './underwater';
import { CreateAccountBanner, TypeCreateAccountBanner } from '../CreateAccountBanner';
import  styles from './styles.module.less';

export const HomePage = () => (
  <div className={styles.pageContainer}>
    <Landscape />
    <Advantages />
    <Wealthier />
    <CreateAccountSmall />
    <Healthier />
    <CreateAccountBanner className={styles.benefits} Type={TypeCreateAccountBanner.Plants} />
  </div>
);

