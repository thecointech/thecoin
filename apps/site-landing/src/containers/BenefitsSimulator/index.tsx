/**
 * Graph to compare
 */

import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Grid, Header } from 'semantic-ui-react';
import { Form } from './Form';
import { BenefitsGraph } from './Graph';
import { CreateAccountBanner, TypeCreateAccountBanner } from 'containers/CreateAccountBanner';
import { createParams, MarketData, fetchMarketData, SimulationParameters } from './simulator';
import styles from './styles.module.less';
import { StatsArea } from './StatsArea';
import { BenefitsReducer } from './reducer';
import { CopyToClipboard } from '@thecointech/shared/components/CopyToClipboard';
import { useLocation } from 'react-router';
import { Location } from 'history';
import queryString from 'query-string';
import { log } from '@thecointech/logging';
import { Decimal } from 'decimal.js-light';

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

const defaultParams = createParams({initialBalance: 1000});

type QueryProps = { sim: any };

export function Compare() {

  const [params, setParams] = useState(defaultParams);
  const [years, setYears] = useState(10);
  const [fxData, setFxData] = useState<MarketData[]|undefined>();
  const [snpData, setSnPData] = useState<MarketData[]|undefined>();

  BenefitsReducer.useStore();

  // Fetch src data
  const location = useLocation<QueryProps>();
  useEffect(() => {
    // First, update our params if there is anything in the query string
    const queryParams = getQueryParams(location);
    if (queryParams) {
      if (queryParams.years) setYears(queryParams.years);
      if (queryParams.params) setParams(queryParams.params);
    }

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

// Clean the incoming data and convert to appropriate types
function parseDecimals(def: any, src: any): any {
  const dest = {} as any;
  for (const key in def) {
    // If present in query, use that value
    dest[key] = (src[key] !== undefined)
      ? new Decimal(src[key])
      : def[key]
  }
  return dest;
}

function parseData(def: any, src: any) {
  if (!def) return;
  const dest = {} as any;
  for (const key in def) {
    // If present in query, use that value
    if (src[key] !== undefined) {

      switch(key) {
        case 'adjustForInflation':  dest[key] = !!src[key]; break;
        case 'shockAbsorber':  dest[key] = parseDecimals(def[key], src[key]); break;
        case 'income':
        case 'cash':
        case 'credit':
          dest[key] = parseData(def[key], src[key]);
          break;
        default:
          dest[key] = parseFloat(src[key].toString());
          break;
      }
    }
    // else, just use the default
    else {
      dest[key] = def[key];
    }
  }
  return dest;
}

function getQueryParams(location: Location<QueryProps>) {

  try {
    const { sim } = queryString.parse(location.search);
    if (sim) {
      const { years, ...rest } = JSON.parse(sim?.toString());
      const params = parseData(defaultParams, rest);
      return {
        years: years ? parseInt(years.toString()) : undefined,
        params,
      }
    }
  }
  catch (e) {
    // We don't really care.
    log.info(`Could not parse sim query params: ${e.message}`);
  }
  return null;
}


