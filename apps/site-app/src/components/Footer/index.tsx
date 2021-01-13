import React from 'react';

import { FooterShared } from '@the-coin/site-base/containers/FooterShared';
import getWindowDimensions from '@the-coin/site-base/components/WindowDimensions';
import { breakpointsValues } from '@the-coin/site-base/components/ResponsiveTool';

import styles from './styles.module.less';

export const Footer = () => {
  const windowDimension = getWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;
  let classForContainer = styles.desktopContent;

  // If Small Screen / Mobile
  if (windowDimension.width <= breakpointTablet){
    classForContainer = styles.mobileContent;
  }
  return (
    <div id={styles.footerContainer} className={classForContainer}>
      <FooterShared />
    </div>
  );
}
