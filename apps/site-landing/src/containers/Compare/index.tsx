/**
 * Graph to compare
 */

import React, { useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';

import { FormCompare } from './FormCompare';
import { GraphCompare } from './GraphCompare';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';

import styles from './styles.module.less';

const translations = defineMessages({
  title: {
    defaultMessage: 'How much will you make?',
    description: 'site.compare.title: Main title for the How much will you make? graph page'
  },
  description: {
    defaultMessage: 'Your chequing account will be with you longer than your retirement savings will. This is what that could look like.',
    description: 'site.compare.description: Main description for the How much will you make? graph page'
  }
});

export function Compare() {

  const [initial, setInitial] = useState(1000);
  const [income, setIncome] = useState(2000);
  const [creditSpend, setCreditSpend] = useState(500);
  const [cashSpend, setCashSpend] = useState(1000);
  const [annualSpend, setAnnualSpend] = useState(1000);

  const [duration, setDuration] = useState(60);

  return (
    <>
      <div className={styles.wrapper}>
        <Header as="h2" className={`x10spaceBefore x10spaceAfter`}>
          <FormattedMessage {...translations.title} />
          <Header.Subheader className={`x5spaceBefore`}>
            <FormattedMessage  {...translations.description} />
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

      <CreateAccountBanner Type={TypeCreateAccountBanner.People} />
    </>
  );
}
