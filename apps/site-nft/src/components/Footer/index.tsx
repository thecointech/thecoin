import React from 'react';
import { FooterShared } from '@thecointech/site-base/containers/FooterShared';

import styles from './styles.module.less';

export const Footer = () => {
  return (
    <div id={styles.footerContainer}>
      <FooterShared />
    </div>
  );
}
