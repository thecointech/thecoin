import * as React from 'react';
import { ContentHeightMeasure } from 'components/ContentHeightMeasure';
import { ContentFader } from '@the-coin/site-base/components/ContentFader';
import { ContentHeightAnimate } from 'components/ContentHeightAnimate';
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
