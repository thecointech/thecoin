import * as React from 'react';
import { ContentHeightMeasure } from '../ContentHeightMeasure';
import { ContentFader } from '../ContentFader';
import { ContentHeightAnimate } from '../ContentHeightAnimate';

export const MainPageTransition: React.FC = (props) => (
  <ContentHeightAnimate>
    <ContentFader>
      <ContentHeightMeasure>{props.children}</ContentHeightMeasure>
    </ContentFader>
  </ContentHeightAnimate>
);
