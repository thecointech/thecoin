import React from 'react';
import Measure from 'react-measure';
import { connect } from 'react-redux';
import { DispatchProps, mapDispatchToProps } from './actions';
import { buildReducer } from './reducer';

import styles from './index.module.css';

interface OwnProps {}

type Props = OwnProps & DispatchProps;

class Measurable extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.onContentSized = this.onContentSized.bind(this);
  }

  onContentSized(bounds) {
    // console.log(`Measuring: ${bounds.bounds.height}`);
    this.props.setHeight(bounds.bounds.height);
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

export default buildReducer<OwnProps>()(
  connect(
    null,
    mapDispatchToProps,
  )(Measurable),
);
