import * as React from 'react';
import { Button, Form, Grid, InputOnChangeData } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState } from 'react';
import styles from './styles.module.css';

export const FormCompare = () => {

    const [duration, setDuration] = useState("0");
    const [starting, setStarting] = useState("0");
  
    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
      if (data.name === "starting"){
        setStarting(data.value);
      } else {
        setDuration(data.value);
      }
    };
  
    const intl = useIntl();
    const labelStartingValue = intl.formatMessage({ id: 'site.compare.label.rangeStarting', defaultMessage:'Starting value:'});
    const labelStartingValueCurrency = intl.formatMessage({ id: 'site.compare.label.rangeStartingCurrency', defaultMessage:'CA$'});
    const labelDurationValue = intl.formatMessage({ id: 'site.compare.label.rangeDuration', defaultMessage:'Duration:'});
    const labelDurationYear = intl.formatMessage({ id: 'site.compare.label.rangeDurationYear', defaultMessage:'Years'});  
        
    return (
      <div id={styles.variablesContainer}>
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

        <Button secondary className={styles.buttonContainer}>
          <FormattedMessage id="site.compare.button" 
                            defaultMessage="Show Me" 
                            description="Button for the graph page" />
        </Button>
      </div>
    );
};