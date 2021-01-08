/**
 * Graph to compare
 */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

import { FormCompare } from './FormCompare';
import { GraphCompare } from './GraphCompare';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';

import styles from './styles.module.less';


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
        <Header as="h2" className={`x6spaceBefore`}>
            <FormattedMessage {...title} />
            <Header.Subheader>
              <FormattedMessage  {...description} />
            </Header.Subheader>
        </Header>

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
