import React, { useEffect, useState } from 'react';
import { Header, Loader } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AreaGraph } from '../../AreaGraph';
import { calcAllResults, CoinReturns, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import styles from './styles.module.less';
import { log } from '@thecointech/logging';

const translations = defineMessages({
  title : {
      defaultMessage: 'Your possible benefits',
      description: 'site.compare.graph.title: Graph title for the How much will you make? graph page'},
  description : {
    defaultMessage: 'Your chequing account will be with you longer than your retirement savings will. This is what that could look like.',
    description: 'site.compare.graph.description: Graph description for the How much will you make? graph page'}
  });

type Props = {
  params: SimulationParameters,
  fxData?: MarketData[],
  snpData?: MarketData[],
}

// TODO: This component does a lot of computation, and should be memoized
export const BenefitsGraph = ({params, snpData}: Props) => {

  //const [allReturns, setAllReturns] = useState<undefined|SimulationState[][]>();
  const [results, setResults] = useState<CoinReturns[]>([]);
  // const [progress, setProgress] = useState<number|undefined>(0);

  useEffect(() => {
    if (!snpData) return;
    const simResults = calcAllResults({
      data: snpData,
      params,
    });

    // Run the update asynchronously to give ourselves a chance to update
    let isCancelled = false;
    setResults([]);
    (async () => {
      for (let r = simResults.next(); !r.done; r = simResults.next()) {
        const {value} = r;
        if (value) setResults(prev => [...prev, value]);
        await delay(1);
      }
    })();

    return () => { isCancelled = true };
  }, [snpData])

  const maxGraphPoints = 12;
  const isLoading = results.length < 12;
  log.trace(`Rendering results: ${results.length}`);
  return (
    <div className={styles.graphContainer}>
      <Header as="h4">
        <FormattedMessage {...translations.title} />
      </Header>
      <FormattedMessage {...translations.description} />
      {isLoading
        ? <GraphLoading />
        : <AreaGraph maxGraphPoints={maxGraphPoints} data={results} />
      }
    </div>
  );
};

const GraphLoading = () => (
  <>
    <Loader active inline='centered' indeterminate={true} />
    Crunching Numbers
  </>
)

// const MemoizedGraphCompare = React.memo(GraphCompareLoaded, (a, b) => (
//   a.fxData === b.fxData &&
//   a.snpData === b.snpData &&
//   isEqual(a.params, b.params)
// ))

// export const GraphCompare = ({params, fxData, snpData}: Partial<Props>) =>
//   (params && snpData && fxData)
//     ? <MemoizedGraphCompare params={params} fxData={fxData} snpData={snpData} />
//     : <Loader active inline='centered' />
