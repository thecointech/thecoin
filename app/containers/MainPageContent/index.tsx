import * as React from 'react';
import { connect } from 'react-redux';
import { LocationStoreState, mapLocationStateToProps } from 'containers/Location/selectors';
import MainRouter from 'containers/MainRouter/index'
import ContentHeightMeasure from 'components/ContentHeightMeasure';
import ContentFader from 'components/ContentFader';
import ContentHeightAnimate from 'components/ContentHeightAnimate';

interface OwnProps { }

type Props = OwnProps & LocationStoreState;

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

export default connect(mapLocationStateToProps)(MainPageContent);
