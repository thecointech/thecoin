import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationRootState } from 'types';
import { makeSelectLocation } from 'containers/App/selectors';
import { createStructuredSelector } from 'reselect';
import { Location } from 'history'

import MainRouter from 'containers/MainRouter/index'
import ContentHeightMeasure from 'components/ContentHeightMeasure';
import ContentFader from 'components/ContentFader';
import ContentHeightAnimate from 'components/ContentHeightAnimate';

interface OwnProps { }
interface StateProps {
  location: Location
}
type Props = OwnProps & StateProps;

class MainPageContent extends React.PureComponent<Props, {}, null> {
  render() {
    const { location } = this.props;
    return (
      <ContentHeightAnimate>
        <ContentFader location={location}>
          <ContentHeightMeasure>
            <MainRouter location={location} />
          </ContentHeightMeasure>
        </ContentFader>
      </ContentHeightAnimate>
    );
  }
}

// Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, StateProps>({
  // All the keys and values are type-safe
  location: makeSelectLocation()
});

export default connect(mapStateToProps)(MainPageContent);
