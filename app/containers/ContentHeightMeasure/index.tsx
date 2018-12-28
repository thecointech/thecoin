import React from 'react';
import Measure from 'react-measure';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import injectReducer from 'utils/injectReducer';
import { setContentHeight } from './actions';
import reducer from './reducer';

import styles from './index.module.css';

interface OwnProps {}
interface DispatchProps {
  onMeasureHeight(height: number, timestamp: number);
}
type Props = OwnProps & DispatchProps;

class Measurable extends React.PureComponent<Props> {
  // Record when this measurable is created.  This allows
  // our clients to filter notifications based
  // on the measurable class's new-ness.
  timestamp: number;

  constructor(props) {
    super(props);
    this.onContentSized = this.onContentSized.bind(this);

    this.timestamp = new Date().getTime();
  }

  onContentSized(bounds) {
    // console.log(`Measuring: ${bounds.bounds.height}`);
    this.props.onMeasureHeight(bounds.bounds.height, this.timestamp);
  }

  render() {
    return (
      <Measure bounds onResize={this.onContentSized}>
        {({ measureRef }) => (
          <section ref={measureRef} className={styles.pageMainInner}>
            {this.props.children}
          </section>
        )}
      </Measure>
    );
  }
}

// Map Disptach to your DispatchProps
export function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onMeasureHeight: (height, ts) => dispatch(setContentHeight(height, ts)),
  };
}

const withReducer = injectReducer<OwnProps>({
  key: 'content',
  reducer,
});

export default withReducer(
  connect(
    null,
    mapDispatchToProps,
  )(Measurable),
);
