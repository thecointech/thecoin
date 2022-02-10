import React, { useEffect, useState } from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import { AreaDatum, AreaGraph, OnClickHandler } from '../../AreaGraph';
import { calcAllResults, CoinReturns, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import { sleep } from '@thecointech/async';
import { log } from '@thecointech/logging';
import { BenefitsReducer } from '../reducer';

type Props = {
  params: SimulationParameters,
  years: number,
  fxData?: MarketData[],
  snpData?: MarketData[],
  animate?: boolean,
}
type SimGenerator = ReturnType<typeof calcAllResults>;

export const BenefitsGraph = ({ params, snpData, animate, years }: Props) => {

  // const [results, setResults] = useState<CoinReturns[]>([]);
  const [progress, setProgress] = useState(0);
  const [simulator, setSimulator] = useState<undefined | SimGenerator>();

  const api = BenefitsReducer.useApi();
  const { results, percentile } = BenefitsReducer.useData();

  // how many weeks to we need to calculate?
  const currentWeek = results.length;
  const maxWeeks = 1 + (years * 52.142);

  const onClick: OnClickHandler = (p, _m) => {
    // We could potentially use the mouse event here
    // to figure out where on the graph was clicked,
    // to figure out exactly what ratio (probability)
    // each section would have, but I doubt anyone
    // other than me would care
    api.setHovered(p.data as any as AreaDatum);
  };

  // If core details change, restart the sim
  useEffect(() => {
    if (!snpData) return;
    log.trace("(Re)Initializing simulation");
    const sim = calcAllResults({
      data: snpData,
      params,
      increment: 6,
      percentile,
    });
    setSimulator(sim);
    // setResults([]);
    api.reset();

  }, [snpData, params]);

  //
  // Run the simulation for the length of time requested.
  // This is both cancellable and resumable
  useEffect(() => {
    if (!simulator) return;
    // Run the update asynchronously to give ourselves a chance to re-render
    let isCancelled = false;
    (async () => {
      const updateEveryMs = 2500; // every 2.5 seconds, update
      log.trace('Begin Sim');

      // Spamming the set* hooks are killing the update speed
      // Cache values for a period then let the UI update
      const started = Date.now();
      let lastUpdate = started;
      let values: CoinReturns[] = [];
      setProgress(0);

      // Iterate only the number of times required
      for (let w = currentWeek; w < maxWeeks; w++) {
        if (isCancelled) return;

        const { value } = simulator.next()
        if (value) values.push(value);

        // Update
        const now = Date.now();
        if (now - lastUpdate > updateEveryMs) {
          lastUpdate = now;
        }
        // Yield back to the page every once in a while
        if (w % 50 == 0) {
          setProgress(w / maxWeeks);
          await sleep(1);
        }
        if (w % 100 > 90) {
          if (w % 100 == 91) {
            api.addResults(values);
            values = [];
          }
          await sleep(1);
        }
      }
      api.addResults(values);
      setProgress(1);
      log.trace(`End Sim: ${((started - Date.now()) / 1000).toPrecision(3)}s`);
    })();
    return () => { isCancelled = true };
  }, [simulator, years]);

  const maxGraphPoints = 15;
  const isLoading = animate
    ? results.length < 12
    : progress < 1;
  const displayData = results.slice(0, maxWeeks);

  return (
    <Segment>
      <Dimmer active={isLoading}>
        <GraphLoading progress={progress} />
      </Dimmer>
      <AreaGraph maxGraphPoints={maxGraphPoints} data={displayData} onClick={onClick} />
    </Segment>
  )
};

const GraphLoading = ({ progress }: { progress: number }) =>
  <Loader active inline='centered' indeterminate={true}
    content={`Simulating: ${(progress * 100).toPrecision(2)}%`}
  />
