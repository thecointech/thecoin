import * as React from 'react';
import { Form, Grid, InputOnChangeData } from 'semantic-ui-react';
import { useIntl } from 'react-intl';
import { useState } from 'react';

import styles from './styles.module.less';

export const DurationLine = () => {

    const [duration, setDuration] = useState("0");

    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
      setDuration(data.value);
    };

    const intl = useIntl();
    const labelDurationValue = intl.formatMessage({ id: 'site.compare.label.rangeDuration', defaultMessage:'Duration:'});
    const labelDurationYear = intl.formatMessage({ id: 'site.compare.label.rangeDurationYear', defaultMessage:'Years'});

    return (
      <>
        <div className={styles.variablesLabelContainer}>{labelDurationValue}</div>
        <Grid columns='equal' textAlign='center'  className={styles.variablesValueContainer}>
          <Grid.Row>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column className={styles.variablesLabelValueContainer}>
              {`${duration} `+labelDurationYear}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Form.Input id="rangeDuration"
            min={1}
            max={80}
            name='duration'
            onChange={handleChange}
            step={1}
            type='range'
            value={duration}
          />
        <div className={styles.variablesScaleContainer}>
            <Grid columns='equal' textAlign='center'>
              <Grid.Row>
                <Grid.Column>
                  1
                </Grid.Column>
                <Grid.Column>
                  40
                </Grid.Column>
                <Grid.Column>
                  80
                </Grid.Column>
              </Grid.Row>
            </Grid>
        </div>
      </>
    );
};
