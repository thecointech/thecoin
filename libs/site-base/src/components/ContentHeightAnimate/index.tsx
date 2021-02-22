import React from 'react';
import AnimateHeight from 'react-animate-height';
import { useSelector } from 'react-redux';
import { LessVars } from '@the-coin/site-semantic-theme/variables';
import { selectContent } from '../ContentHeightMeasure/selector';
import styles from './styles.module.less';

export const ContentHeightAnimate: React.FC = (props)=> {

  const mainHeightDivStyle = useSelector(selectContent);
  return (
    <AnimateHeight duration={LessVars.pageTransitionDuration} height={mainHeightDivStyle.height}>
      <div className={styles.mainHeightDivStyle} style={mainHeightDivStyle}>
        {props.children}
      </div>
    </AnimateHeight>
  );
}
