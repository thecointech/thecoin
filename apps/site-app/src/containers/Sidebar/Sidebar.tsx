import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import React from 'react';
import styles from './styles.module.less';

// Fixed positioning doesn't work in grid.
// First we will setup the site, then deal
// with fixed positioning
export const Sidebar = () => (
  <div className={styles.sidebar}>
    {/* <div className={styles.wrapper}> */}
      <PageSidebar direction="right" />
    {/* </div> */}
  </div>
)
