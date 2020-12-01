import * as React from 'react';
import { Form, Grid, InputOnChangeData } from 'semantic-ui-react';
import { useState } from 'react';
import styles from './styles.module.less';
import { FormattedNumber } from 'react-intl';


export type Props = {
 labelValue: string;
 labelValueCurrency: string;
 scaleType?: "decimal" | "percent" | "currency" | "unit" | undefined;
 minRange: number;
 maxRange: number;
 stepRange: number;
 minRangeScale: number;
 medRangeScale: number;
 maxRangeScale: number;
}

export const RangeFieldAndScale = (props: Props) => {

    const [starting, setStarting] = useState(0);

    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
      setStarting(parseInt(data.value));
    };

    return (
      <>
        <div className={styles.variablesLabelContainer}>{props.labelValue}</div>
        <Grid columns='equal' textAlign='center'  className={styles.variablesValueContainer}>
          <Grid.Row>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column className={styles.variablesLabelValueContainer}>
              <FormattedNumber value={starting} localeMatcher="best fit" unitDisplay="narrow" style={props.scaleType} currency={ props.labelValueCurrency } />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Form.Input id="rangeStarting"
            min={props.minRange}
            max={props.maxRange}
            name='starting'
            onChange={handleChange}
            step={props.stepRange}
            type='range'
            value={starting}
          />
        <div className={styles.variablesScaleContainer}>
            <Grid columns='equal' textAlign='center'>
              <Grid.Row>
                <Grid.Column>
                  {props.minRangeScale}
                </Grid.Column>
                <Grid.Column>
                  {props.medRangeScale}
                </Grid.Column>
                <Grid.Column>
                  {props.maxRangeScale}
                </Grid.Column>
              </Grid.Row>
            </Grid>
        </div>
      </>
    );
};
