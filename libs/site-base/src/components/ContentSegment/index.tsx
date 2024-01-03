import * as React from 'react';
import styles from './styles.module.less';

export const ContentSegment = (props: { children: React.ReactNode }) => (
  <div className={styles.contentSegment}>
    {props.children}
  </div>
);

