import * as React from 'react';
import { useState } from 'react';
import styles from './styles.module.less';
import { FormattedNumber, MessageDescriptor } from 'react-intl';
import { Range, getTrackBackground } from "react-range";
import { LessVars } from "@thecointech/site-semantic-theme/variables";

export type Props = {
 scaleType?: "decimal" | "percent" | "currency" | "unit" | undefined;
 currency?: "CAD",
 label: MessageDescriptor,
 initial?: number;
 maximum: number;
 minimum?: number;
 step?: number;
 onChange?: (value: number) => void;
}

export const RangeFieldAndScale = (props: Props) => {

    const [value, setValue] = useState(props.initial ?? 0);

    const minimum = props.minimum ?? 0;
    const maximum = props.maximum;
    const step = props.step ?? 1;
    // const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
    //   setValue(parseInt(data.value));
    //   props.onChange?.(value);
    // };

    return (
      <div className={styles.container}>
        <div className={styles.label}>
          <FormattedNumber
            value={value}
            currency={props.currency}
            currencyDisplay={"narrowSymbol"}
            style={props.scaleType}
            minimumFractionDigits={0}
            maximumFractionDigits={0}
           />
        </div>
        <Range
          step={step}
          min={minimum}
          max={maximum}
          values={[value]}
          onChange={(values) => setValue(values[0])}
          renderTrack={(props) => (
            <SliderTrack
              value={value}
              max={maximum}
              min={minimum}
              {...props}
            />)}
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
const SliderTrack: React.FC<TrackProps> = ({ props, value, max, min, children }) => (
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
          colors: [LessVars.theCoinPaletteGreen3, "#FFFFFF1A"],
          min,
          max,
        }),
      }}
    >
      {children}
    </div>
  </div>
)

const SliderThumb: React.FC<{ props: any }> = ({ props }) => (
  <div
    {...props}
    className={styles.thumb}
  />
)
