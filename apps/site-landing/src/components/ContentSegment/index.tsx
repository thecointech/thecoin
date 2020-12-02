import * as React from 'react';
import styles from './styles.module.less';

export const ContentSegment: React.FunctionComponent = (props) => (
  <div className={styles.contentSegment}>
    {props.children}
  </div>
);

