import React from 'react';
import AnimateHeight from 'react-animate-height';
import { useSelector } from 'react-redux';
import { LessVars } from '@thecointech/site-semantic-theme/variables';
import { selectContent } from '../ContentHeightMeasure/selector';
import styles from './styles.module.less';

export const ContentHeightAnimate = (props: { children: React.ReactNode })=> {

  const mainHeightDivStyle = useSelector(selectContent);
  return (
    <AnimateHeight duration={LessVars.pageTransitionMillis} height={mainHeightDivStyle.height}>
      <div className={styles.mainHeightDivStyle} style={mainHeightDivStyle}>
        {props.children}
      </div>
    </AnimateHeight>
  );
}
