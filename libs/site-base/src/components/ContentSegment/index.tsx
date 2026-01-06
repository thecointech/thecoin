import React, { type PropsWithChildren } from 'react';
import styles from './styles.module.less';

export const ContentSegment = ({ children }: PropsWithChildren<{}>) => (
  <div className={styles.contentSegment}>
    {children}
  </div>
);

