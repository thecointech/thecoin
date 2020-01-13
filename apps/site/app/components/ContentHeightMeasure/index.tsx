import React from 'react';
import Measure, { ContentRect } from 'react-measure';
import { connect } from 'react-redux';
import { DispatchProps, mapDispatchToProps } from './actions';
import { buildReducer } from './reducer';

interface OwnProps {}

type Props = OwnProps & DispatchProps;

class Measurable extends React.PureComponent<Props> {
  timestamp = new Date().getTime();

  onContentSized = (contentRect: ContentRect) => {
    const height = contentRect.bounds?.height;
    if (height)
      this.props.setHeight(height, this.timestamp);
  }

  render() {
    return (
      <Measure bounds onResize={this.onContentSized}>
        {({ measureRef }) => <div ref={measureRef}>{this.props.children}</div>}
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
