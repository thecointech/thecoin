import React from 'react';

import { Subscribe } from '../../containers/Subscribe';
import { FooterShared } from '@thecointech/site-base/containers/FooterShared';

import styles from './styles.module.less';

export const Footer = () => {

  return (
    <div id={styles.footerContainer} className={styles.desktopContent}>
        <Subscribe />
        <FooterShared />
    </div>
  );
}
