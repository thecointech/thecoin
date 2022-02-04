/**
 * Graph to compare
 */

import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import { FormCompare } from './Form';
import { BenefitsGraph } from './Graph';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';
import { createParams, MarketData, getData } from '../ReturnProfile/data';
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

const defaultParams = {
  ...createParams({initialBalance: 1000}),
  years: 10,
}

export function Compare() {

  const [params, setParams] = useState(defaultParams);
  const [fxData, setFxData] = useState<MarketData[]|undefined>();
  const [snpData, setSnPData] = useState<MarketData[]|undefined>();

  // Fetch src data
  useEffect(() => {
    getData().then(setSnPData);
    setFxData([]);
  }, [])

  const {years, ...simParams} = params;

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
              <FormCompare params={params} setParams={setParams} />
            </Grid.Column>
            <Grid.Column textAlign='left' width={10} floated='left' >
              <div className={styles.graphContainer}>
                <BenefitsGraph years={years} params={simParams} snpData={snpData} fxData={fxData} />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>

      <CreateAccountBanner Type={TypeCreateAccountBanner.People} />
    </>
  );
}
