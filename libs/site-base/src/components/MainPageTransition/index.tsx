import React, { type PropsWithChildren } from 'react';
import { ContentHeightMeasure } from '../ContentHeightMeasure';
import { ContentFader } from '../ContentFader';
import { ContentHeightAnimate } from '../ContentHeightAnimate';

export const MainPageTransition = (props: PropsWithChildren<{}>) => (
  <ContentHeightAnimate>
    <ContentFader>
      <ContentHeightMeasure>{props.children}</ContentHeightMeasure>
    </ContentFader>
  </ContentHeightAnimate>
);
