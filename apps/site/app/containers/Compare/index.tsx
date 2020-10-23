/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form, Grid, Header, InputOnChangeData, Button } from 'semantic-ui-react';
import { CreateAccountBanner } from 'containers/CreateAccountBanner';
import styles from './styles.module.css';
import { useState } from 'react';

export function Compare() {
  const [duration, setDuration] = useState("0");
  const [starting, setStarting] = useState("0");

  const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
    //setDuration( data.value );
    console.log(data.name === "starting")
    if (data.name === "starting"){
      setStarting(data.value);
    } else {
      setDuration(data.value);
    }
  }

  let intl = useIntl();
  const labelStartingValue = intl.formatMessage({ id: 'site.compare.label.rangeStarting', defaultMessage:'Starting value:'});
  const labelStartingValueCurrency = intl.formatMessage({ id: 'site.compare.label.rangeStartingCurrency', defaultMessage:'CA$'});
  const labelDurationValue = intl.formatMessage({ id: 'site.compare.label.rangeDuration', defaultMessage:'Duration:'});
  const labelDurationYear = intl.formatMessage({ id: 'site.compare.label.rangeDurationYear', defaultMessage:'Years'});


  return (
      <>
        <div className={styles.wrapper}>
            <Grid className={styles.content} columns='equal' textAlign='center' stackable>
              <Grid.Row>
                <Grid.Column>
                    <Header as="h2">
                        <FormattedMessage 
                              id="site.compare.title" 
                              defaultMessage="How much will you make?"
                              description="Main title for the How much will you make? graph page" />
                    </Header>

                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                        <FormattedMessage 
                              id="site.compare.description" 
                              defaultMessage="Your chequing account will be with you longer than your retirement savings will. This is what that could look like."
                              description="Main description for the How much will you make? graph page" />
                  </Grid.Column>
                </Grid.Row>
              </Grid>

              <Grid columns={3} stackable>
                <Grid.Row stretched>
                  <Grid.Column textAlign='center'>
                    <div id={styles.variablesContainer}>
                          <Form.Input id="rangeStarting"
                              label={labelStartingValue+` ${starting} `+labelStartingValueCurrency}
                              min={100}
                              max={100000}
                              name='starting'
                              onChange={handleChange}
                              step={100}
                              type='range'
                              value={starting}
                            />
                          <Form.Input id="rangeDuration"
                              label={labelDurationValue+` ${duration} `+labelDurationYear}
                              min={1}
                              max={60}
                              name='duration'
                              onChange={handleChange}
                              step={1}
                              type='range'
                              value={duration}
                            />

                            <Button secondary>
                              <FormattedMessage id="site.compare.button" 
                                                defaultMessage="Show Me" 
                                                description="Button for the graph page" />
                            </Button>
                    </div>
                  </Grid.Column>
                  <Grid.Column textAlign='left'>
                    <div id={styles.graphContainer}>
                      <Header as="h4">
                          <FormattedMessage 
                                id="site.compare.graph.title" 
                                defaultMessage="Your possible benefits"
                                description="Graph title for the How much will you make? graph page" />
                        </Header>
                        <FormattedMessage 
                                id="site.compare.graph.description" 
                                defaultMessage="There is a 95% chance you're return will be in that area."
                                description="Graph description for the How much will you make? graph page" />
                                
                        <img src="./images/Group576.png" />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
            </Grid>
        </div>

      <CreateAccountBanner />
    </>
  );
}
