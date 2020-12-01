import * as React from 'react';
import { Form, Grid, InputOnChangeData } from 'semantic-ui-react';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import styles from './styles.module.less';

export const StartingValueLine = () => {

    const [starting, setStarting] = useState("0");

    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
      setStarting(data.value);
    };

    const intl = useIntl();
    const labelStartingValue = intl.formatMessage({ id: 'site.compare.label.rangeStarting', defaultMessage:'Starting value:'});
    const labelStartingValueCurrency = intl.formatMessage({ id: 'site.compare.label.rangeStartingCurrency', defaultMessage:'CA$'});

    return (
      <>
        <div className={styles.variablesLabelContainer}>{labelStartingValue}</div>
        <Grid columns='equal' textAlign='center'  className={styles.variablesValueContainer}>
          <Grid.Row>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column className={styles.variablesLabelValueContainer}>
              {`${starting} `+labelStartingValueCurrency}
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Form.Input id="rangeStarting"
            min={1000}
            max={100000}
            name='starting'
            onChange={handleChange}
            step={100}
            type='range'
            value={starting}
          />
        <div className={styles.variablesScaleContainer}>
            <Grid columns='equal' textAlign='center'>
              <Grid.Row>
                <Grid.Column>
                  1.000
                </Grid.Column>
                <Grid.Column>
                  5.000
                </Grid.Column>
                <Grid.Column>
                  100.000
                </Grid.Column>
              </Grid.Row>
            </Grid>
        </div>
      </>
    );
};
