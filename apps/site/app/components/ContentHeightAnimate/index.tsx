import React from 'react';
import AnimateHeight from 'react-animate-height';
import { useSelector } from 'react-redux';
import { TransitionDuration } from 'styles/constants';
import styles from './styles.module.css';

import { selectContent } from '../ContentHeightMeasure/selector';

export const ContentHeightAnimate: React.FC = (props)=> {

  const mainHeightDivStyle = useSelector(selectContent);

  return (
    <AnimateHeight duration={TransitionDuration} height={mainHeightDivStyle.height}>
      <div className={styles.mainHeightDivStyle} style={mainHeightDivStyle}>
        {props.children}
      </div>
    </AnimateHeight>
  );
}
