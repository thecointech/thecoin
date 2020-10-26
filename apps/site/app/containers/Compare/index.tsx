/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import { CreateAccountBanner } from 'containers/CreateAccountBanner';
import { FormCompare } from './FormCompare';
import { GraphCompare } from './GraphCompare';

import styles from './styles.module.css';


export function Compare() {

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
                    <FormCompare />
                  </Grid.Column>
                  <Grid.Column textAlign='left' width={10} floated='left' >
                      <GraphCompare />
                    </Grid.Column>
                  </Grid.Row>
            </Grid>
        </div>

      <CreateAccountBanner />
    </>
  );
}
