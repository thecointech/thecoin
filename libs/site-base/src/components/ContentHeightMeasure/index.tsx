import React, { useCallback, useState } from 'react';
import Measure, { ContentRect } from 'react-measure';
import { HeightMeasureReducer } from './reducer';


export const ContentHeightMeasure: React.FC = (props) => {
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
      {({ measureRef }) => <div ref={measureRef}>{props.children}</div>}
    </Measure>
  );
}
