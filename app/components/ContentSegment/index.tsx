import * as React from 'react';
// import ContentHeightMeasure from 'components/ContentHeightMeasure';
// import ContentFader from 'components/ContentFader';
// import ContentHeightAnimate from 'components/ContentHeightAnimate';
// import { Location } from 'history';

import styles from './index.module.css';

export const ContentSegment: React.FunctionComponent = (props) => (
  <div className={styles.contentSegment}>
    {props.children}
  </div>
);

