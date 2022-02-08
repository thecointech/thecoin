import * as React from 'react';
import { useState } from 'react';
import { FormattedMessage, FormattedNumber, MessageDescriptor } from 'react-intl';
import type { NumberFormatOptionsStyle } from '@formatjs/ecma402-abstract';

import { Range, getTrackBackground } from 'react-range';
import { LessVars } from '@thecointech/site-semantic-theme/variables';
import styles from './styles.module.less';

export type Props = {
 label: MessageDescriptor,
 scaleType?: NumberFormatOptionsStyle;
 className?: string;
 unit?: string,
 currency?: 'CAD',
 initial?: number;
 maximum: number;
 minimum?: number;
 step?: number;
 onChange: (value: number) => void;
}

export const RangeFieldAndScale = (props: Props) => {
  const [value, setValue] = useState(props.initial ?? 0);

  const minimum = props.minimum ?? 0;
  const { maximum } = props;
  const step = props.step ?? 1;

  const onChange = ([value]: number[]) => {
    setValue(value);
    props.onChange(value);
  };

  return (
    <div className={`${styles.container} ${props.className ?? ''}`}>
      <div className={styles.label}>
        <FormattedMessage {...props.label} tagName="span" />
        <FormattedNumber
          value={value}
          currency={props.currency}
          currencyDisplay="narrowSymbol"
          style={props.scaleType}
          unit={props.unit}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        />
      </div>
      <Range
        step={step}
        min={minimum}
        max={maximum}
        values={[value]}
        onChange={onChange}
        renderTrack={props => (
          <SliderTrack
            value={value}
            max={maximum}
            min={minimum}
            {...props}
          />
        )}
        renderThumb={SliderThumb}
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
}
const SliderTrack: React.FC<TrackProps> = ({
  props, value, max, min, children,
}) => (
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

const SliderThumb: React.FC<{ props: any }> = ({ props }) => (
  <div
    {...props}
    className={styles.thumb}
  />
);
