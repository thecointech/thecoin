import React from 'react';
import AnimateHeight from 'react-animate-height';
import styles from './index.module.css';
import { createStructuredSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { connect } from 'react-redux';
import { makeSelectContentHeight } from 'containers/ContentHeightMeasure/selector';

interface StateProps {
  contentHeight: number;
}

type Props = StateProps;
class ContentHeightAnimate extends React.PureComponent<Props> {
  render() {
    const { contentHeight } = this.props;
    const mainHeightDivStyle = { height: contentHeight };

    return (
      <AnimateHeight duration={300} height={contentHeight}>
        <div className={styles.mainHeightDivStyle} style={mainHeightDivStyle}>
          {this.props.children}
        </div>
      </AnimateHeight>
    );
  }
}

// Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, StateProps>({
  // All the keys and values are type-safe
  contentHeight: makeSelectContentHeight()
});

export default connect(mapStateToProps)(ContentHeightAnimate);