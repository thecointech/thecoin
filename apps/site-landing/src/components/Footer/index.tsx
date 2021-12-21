import React from 'react';

import { Subscribe } from '../../containers/Subscribe';
import { FooterShared } from '@thecointech/site-base/containers/FooterShared';

import styles from './styles.module.less';

export const Footer = () => {

  return (
    <FooterShared id={styles.footerOverrides} background={styles.background}>
      <Subscribe />
    </FooterShared>
  );
}
