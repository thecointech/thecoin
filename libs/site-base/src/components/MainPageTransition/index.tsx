import * as React from 'react';
import { ContentHeightMeasure } from '../ContentHeightMeasure';
import { ContentFader } from '../ContentFader';
import { ContentHeightAnimate } from '../ContentHeightAnimate';
import { Location } from 'history';

interface OwnProps {
  location: Location;
}
type Props = OwnProps;

class MainPageTransition extends React.PureComponent<Props, {}, null> {
  render() {
    const { location } = this.props;
    return (
      <ContentHeightAnimate>
        <ContentFader location={location}>
          <ContentHeightMeasure>{this.props.children}</ContentHeightMeasure>
        </ContentFader>
      </ContentHeightAnimate>
    );
  }
}

export default MainPageTransition;
