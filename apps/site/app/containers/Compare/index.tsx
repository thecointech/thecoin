/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Grid, Header, InputOnChangeData } from 'semantic-ui-react';
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
  return (
      <>
        <div className={styles.wrapper} id={styles.wedomore}>
            <Grid className={styles.content} columns='equal' textAlign='center' stackable>
              <Grid.Row>
                <Grid.Column>
                    <Header as="h2">
                        <FormattedMessage 
                              id="site.wedomore.title" 
                              defaultMessage="We Do More"
                              description="Main title for the We Do More page" />
                    </Header>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                  <Form.Input id={styles.myRange} className={styles.slider}
                      label={`Starting value: ${starting} CA$`}
                      min={100}
                      max={100000}
                      name='starting'
                      onChange={handleChange}
                      step={100}
                      type='range'
                      value={starting}
                    />
                    </Grid.Column>
                  </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                  <Form.Input
                      label={`Duration: ${duration} years `}
                      min={1}
                      max={60}
                      name='duration'
                      onChange={handleChange}
                      step={1}
                      type='range'
                      value={duration}
                    />
                    </Grid.Column>
                  </Grid.Row>
            </Grid>
        </div>

      <CreateAccountBanner />
    </>
  );
}
