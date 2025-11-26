import React, { useCallback, useState, type PropsWithChildren } from 'react';
import Measure, { ContentRect } from 'react-measure';
import { HeightMeasureReducer } from './reducer';
import { useLocation } from 'react-router';

export const ContentHeightMeasure = ({ children }: PropsWithChildren<{}>) => {
  const [timestamp] = useState(new Date().getTime());
  HeightMeasureReducer.useStore();
  const location = useLocation();
  const actions = HeightMeasureReducer.useApi();
  const onContentSized = useCallback((contentRect: ContentRect) => {
    const height = contentRect.bounds?.height;
    if (height)
      actions.setHeight(height, timestamp);
  }, [actions]);

  return (
    <Measure bounds onResize={onContentSized}>
      {({ measureRef }) => <div className={"Immameasuring" + location.key} ref={measureRef}>{children}</div>}
    </Measure>
  );
}
