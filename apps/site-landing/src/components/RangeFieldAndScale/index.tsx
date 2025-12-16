import React from 'react';
import { useState } from 'react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

import { Range, getTrackBackground } from 'react-range';
import { LessVars } from '@thecointech/site-semantic-theme/variables';
import styles from './styles.module.less';
import { UxNumeric, UxNumericType } from '@thecointech/shared';
import { MessageWithValues } from '@thecointech/shared/types';

export type Props = {
 label: MessageDescriptor,
 tooltip: MessageWithValues,
 scaleType?: UxNumericType;
 className?: string;
 unit?: string,
 initial?: number;
 maximum: number;
 minimum?: number;
 step?: number;
 onChange: (value: number) => void;
}

export const RangeFieldAndScale = (props: Props) => {
  const [value, setValue] = useState(props.initial ?? 0);

  const tooltip = useIntl().formatMessage(props.tooltip, props.tooltip.values)
  const minimum = props.minimum ?? 0;
  const { maximum } = props;
  const step = props.step ?? 1;

  const onChange = (value: number) => {
    setValue(value);
    props.onChange(value);
  };

  return (
    <div className={`${styles.container} ${props.className ?? ''}`} data-tooltip={tooltip}>
      <div className={styles.label}>
        <FormattedMessage {...props.label} tagName="span" />
        <UxNumeric
          defaultValue={value}
          onValue={v => onChange(v ?? props.initial ?? 0)}
          onValidate={() => null}

          min={minimum}
          //max={maximum}
          type={props.scaleType}
        />
      </div>
      <Range
        step={step}
        min={minimum}
        max={maximum}
        values={[value]}
        onChange={([value]) => onChange(value)}
        renderTrack={props => (
          <SliderTrack
            value={value}
            max={maximum}
            min={minimum}
            {...props}
          />
        )}
        renderThumb={({ props }) => <SliderThumb {...props} />}
      />
      <div className={styles.scales}>
        <span>{minimum}</span>
        <span>{(minimum + maximum) / 2}</span>
        <span>{maximum}</span>
      </div>
    </div>
  );
};

type TrackProps = {
  value: number,
  max: number,
  min: number,
  props: any,
  children: React.ReactNode,
}
const SliderTrack = ({
  props, value, max, min, children,
}: TrackProps) => (
  <div
    onMouseDown={props.onMouseDown}
    onTouchStart={props.onTouchStart}
    className={styles.track}
    style={{
      ...props.style,
    }}
  >
    <div
      ref={props.ref}
      className={styles.empty}
      style={{
        background: getTrackBackground({
          values: [value],
          colors: [LessVars.theCoinPaletteGreen3, '#FFFFFF1A'],
          min,
          max,
        }),
      }}
    >
      {children}
    </div>
  </div>
);

const SliderThumb = (props: any) => (
  <div
    {...props}
    className={styles.thumb}
  />
);
