/**
 * Graph to compare
 */

import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import { Form } from './Form';
import { BenefitsGraph } from './Graph';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';
import { MarketData, fetchMarketData, SimulationParameters } from './simulator';
import styles from './styles.module.less';
import { StatsArea } from './StatsArea';
import { BenefitsReducer } from './reducer';
import { CopyToClipboard } from '@thecointech/shared/components/CopyToClipboard';
import { getInitParams } from './init';

const translations = defineMessages({
  title: {
    defaultMessage: 'How much will you make?',
    description: 'site.compare.title: Main title for the How much will you make? graph page'
  },
  description: {
    defaultMessage: 'Your chequing account will be with you longer than your retirement savings will. This is what that could look like.',
    description: 'site.compare.description: Main description for the How much will you make? graph page'
  },
  getLink: {
    defaultMessage: 'Shareable Link',
    description: 'site.compare.description: Link to share with whoever:'
  }
});

// Put this outside the React component so it
// evaluates first (and only once)
const init = getInitParams();

export function Compare() {

  const [params, setParams] = useState(init.params);
  const [years, setYears] = useState(init.years);
  const [fxData, setFxData] = useState<MarketData[]|undefined>();
  const [snpData, setSnPData] = useState<MarketData[]|undefined>();

  BenefitsReducer.useStore();

  // Fetch src data
  useEffect(() => {


    fetchMarketData().then(setSnPData);
    setFxData([]);
  }, [])

  const link = getLink(params, years);

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
              <Form
                params={params}
                setParams={setParams}
                years={years}
                setYears={setYears}
              />
            </Grid.Column>
            <Grid.Column textAlign='left' width={10} floated='left' >
              <div className={styles.graphContainer}>
                <BenefitsGraph
                  years={years}
                  params={params}
                  snpData={snpData}
                  fxData={fxData}
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <StatsArea />
        <div className={styles.getLink}>
          <FormattedMessage {...translations.getLink} />
          <CopyToClipboard payload={link}>{link}</CopyToClipboard>
        </div>
      </div>

      <CreateAccountBanner Type={TypeCreateAccountBanner.People} />
    </>
  );
}

function getLink(params: SimulationParameters, years: number) {
  const sanitized = {
    ...params,
    shockAbsorber: {
      cushionDown: params.shockAbsorber.cushionDown.toNumber(),
      cushionUp: params.shockAbsorber.cushionUp.toNumber(),
      maximumProtected: params.shockAbsorber.maximumProtected.toNumber(),
      trailingMonths: params.shockAbsorber.trailingMonths.toNumber(),
    },
    years,
  }

  return `${window.location.origin}/#/compare?sim=${encodeURIComponent(JSON.stringify(sanitized))}`;
}
