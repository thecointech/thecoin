import React, { useEffect, useState } from 'react';
import { Header, Loader } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AreaGraph } from '../../AreaGraph';
import { calcAllResults, CoinReturns, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import styles from './styles.module.less';
import { sleep } from '@thecointech/async';

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
  animate?: boolean,
}

// TODO: This component does a lot of computation, and should be memoized
export const BenefitsGraph = ({params, snpData, animate}: Props) => {

  const [results, setResults] = useState<CoinReturns[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!snpData) return;
    const simResults = calcAllResults({
      data: snpData,
      params,
      increment: 6,
    });

    // Run the update asynchronously to give ourselves a chance to update
    let isCancelled = false;
    setResults([]);
    setProgress(0);

    (async () => {
      let lastRender = Date.now();
      const maxWeeks = (params.maxDuration.years ?? 60) * 52.142;
      console.time('Calculating')

      for (let w = 0; w < maxWeeks; w++) {
        if (isCancelled) break;
        const r = simResults.next()
        const {value} = r;
        if (value) setResults(prev => [...prev, value]);
        setProgress(w / maxWeeks);

        // How often do we update?  Once per second?
        const now = Date.now();
        if (now - lastRender > 250) {
          await sleep(1);
          lastRender = now;
        }
      }
      setProgress(1);
      console.timeEnd('Calculating')

    })();

    return () => { isCancelled = true };
  }, [snpData])

  const maxGraphPoints = 12;
  const isLoading = animate
    ? results.length < 12
    : progress < 1;
  return (
    <div className={styles.graphContainer}>
      <Header as="h4">
        <FormattedMessage {...translations.title} />
      </Header>
      <FormattedMessage {...translations.description} />
      {isLoading
        ? <GraphLoading progress={progress} />
        : <AreaGraph maxGraphPoints={maxGraphPoints} data={results} />
      }
    </div>
  );
};

const GraphLoading = ({progress}: { progress: number}) => (
  <>
    <Loader active inline='centered' indeterminate={true} />
    Crunching: {(progress * 100).toPrecision(2)}%
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
