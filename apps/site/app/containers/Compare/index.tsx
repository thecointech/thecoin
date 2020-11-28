/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

import { FormCompare } from './FormCompare';
import { GraphCompare } from './GraphCompare';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';

import styles from './styles.module.css';


const title = { id:"site.compare.title", 
                defaultMessage:"How much will you make?",
                description:"Main title for the How much will you make? graph page"};

const description = { id:"site.compare.description", 
                      defaultMessage:"Your chequing account will be with you longer than your retirement savings will. This is what that could look like.",
                      description:"Main description for the How much will you make? graph page"};

export function Compare() {

  return (
    <>
      <div className={styles.wrapper}>
          <Grid className={`x6spaceBefore`} columns='equal' textAlign='center' stackable>
            <Grid.Row>
              <Grid.Column>
                  <Header as="h2">
                      <FormattedMessage {...title} />
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                      <FormattedMessage  {...description} />
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

      <CreateAccountBanner Type={ TypeCreateAccountBanner.People } />
    </>
  );
}
