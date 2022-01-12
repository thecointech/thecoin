import * as React from 'react';
import { Input, Grid, InputOnChangeData } from 'semantic-ui-react';
import { useState } from 'react';
import styles from './styles.module.less';
import { FormattedNumber } from 'react-intl';


export type Props = {
 scaleType?: "decimal" | "percent" | "currency" | "unit" | undefined;
 initial?: number;
 minimum: number;
 maximum: number;
 step?: number;
 onChange?: (value: number) => void;
}

export const RangeFieldAndScale = (props: Props) => {

    const [value, setValue] = useState(props.initial ?? 0);

    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
      setValue(parseInt(data.value));
      props.onChange?.(value);
    };

    return (
      <div className={styles.container}>
        <div className={styles.label}>
          <FormattedNumber value={value} localeMatcher="best fit" unitDisplay="narrow" style={props.scaleType} />
        </div>
        <Input
          className={styles.slider}
          min={props.minimum}
          max={props.maximum}
          name='starting'
          onChange={handleChange}
          step={props.step}
          type='range'
          value={value}
        />
        <div className={styles.scales}>
          <span>{props.minimum}</span>
          <span>{(props.minimum + props.maximum) / 2}</span>
          <span>{props.maximum}</span>
        </div>
      </div>
    );
};
