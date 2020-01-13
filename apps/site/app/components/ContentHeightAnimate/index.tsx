import React from 'react';
import AnimateHeight from 'react-animate-height';
import { connect } from 'react-redux';
import { TransitionDuration } from 'styles/constants';
import styles from './index.module.css';

import { mapStateToProps } from '../ContentHeightMeasure/selector';
import { ContentState } from '../ContentHeightMeasure/types';

interface OwnProps {}

type Props = OwnProps & ContentState;

class ContentHeightAnimate extends React.PureComponent<Props> {
  render() {
    const { height } = this.props;
    const mainHeightDivStyle = { height };

    return (
      <AnimateHeight duration={TransitionDuration} height={height}>
        <div className={styles.mainHeightDivStyle} style={mainHeightDivStyle}>
          {this.props.children}
        </div>
      </AnimateHeight>
    );
  }
}

export default connect(mapStateToProps)(ContentHeightAnimate);
