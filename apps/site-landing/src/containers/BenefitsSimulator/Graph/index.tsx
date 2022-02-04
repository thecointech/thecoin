import React, { useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react';
import { AreaGraph } from '../../AreaGraph';
import { calcAllResults, CoinReturns, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import { sleep } from '@thecointech/async';

type Props = {
  params: SimulationParameters,
  years: number,
  fxData?: MarketData[],
  snpData?: MarketData[],
  animate?: boolean,
}

type SimGenerator = ReturnType<typeof calcAllResults>;
// TODO: This component does a lot of computation, and should be memoized
export const BenefitsGraph = ({params, snpData, animate, years}: Props) => {

  const [results, setResults] = useState<CoinReturns[]>([]);
  const [progress, setProgress] = useState(0);
  const [simulator, setSimulator] = useState<undefined|SimGenerator>()

  // how many weeks to we need to calculate?
  const currentWeek = results.length;
  const maxWeeks = 1 + (years * 52.142);

  // If core details change, restart the sim
  useEffect(() => {
    if (!snpData) return;
    const sim = calcAllResults({
      data: snpData,
      params,
      increment: 6,
    });
    setResults([]);
    setProgress(0);
    setSimulator(sim);
  }, [snpData]);

  //
  // We can change the length of time being displayed
  useEffect(() => {
    if (!simulator) return;
    // Run the update asynchronously to give ourselves a chance to re-render
    let isCancelled = false;
    (async () => {
      let lastRender = Date.now();
      console.time('Calculating')

      // Iterate only the number of times required
      for (let w = currentWeek; w < maxWeeks; w++) {
        if (isCancelled) break;
        const r = simulator.next()
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
      console.timeEnd('Calculating');

    })();
    return () => { isCancelled = true };
  }, [simulator, years]);

  const maxGraphPoints = 15;
  const isLoading = animate
    ? results.length < 12
    : progress < 1;
  const displayData = results.slice(0, maxWeeks)

  return isLoading
        ? <GraphLoading progress={progress} />
        : <AreaGraph maxGraphPoints={maxGraphPoints} data={displayData} />
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
