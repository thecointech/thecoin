import React, { useCallback, useState } from 'react';
import Measure, { ContentRect } from 'react-measure';
import { HeightMeasureReducer } from './reducer';


export const ContentHeightMeasure = (props: { children: React.ReactNode }) => {
  const [timestamp] = useState(new Date().getTime());
  HeightMeasureReducer.useStore();
  const actions = HeightMeasureReducer.useApi();
  const onContentSized = useCallback((contentRect: ContentRect) => {
    const height = contentRect.bounds?.height;
    if (height)
      actions.setHeight(height, timestamp);
  }, [actions]);

  return (
    <Measure bounds onResize={onContentSized}>
      {({ measureRef }: { measureRef: React.RefObject<HTMLDivElement> }) => <div ref={measureRef}>{props.children}</div>}
    </Measure>
  );
}

