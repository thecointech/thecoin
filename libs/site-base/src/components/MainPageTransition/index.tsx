import React, { type PropsWithChildren } from 'react';
import styles from './styles.module.less';

export const MainPageTransition = (props: PropsWithChildren<{}>) => (
  <div className={styles.mainContent}>
    {props.children}
  </div>
);
