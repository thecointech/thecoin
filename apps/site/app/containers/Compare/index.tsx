/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form, Grid, Header, InputOnChangeData, Button } from 'semantic-ui-react';
import { CreateAccountBanner } from 'containers/CreateAccountBanner';
import styles from './styles.module.css';
import { useState } from 'react';

//TODO: replace by the real graph
import Graph from './images/Group576.svg';

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
                  <Grid.Column textAlign='center' width={5} floated='right'>
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
                  </Grid.Column>
                  <Grid.Column textAlign='left' width={10} floated='left' >
                    <div className={styles.graphContainer}>
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
                               <br /> <br /> <br /> 
                        <img src={Graph} />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
            </Grid>
        </div>

      <CreateAccountBanner />
    </>
  );
}
