import React, { useEffect, useState } from 'react';
import { Header, Loader, Progress, Segment } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AreaGraph } from '../../AreaGraph';
import { calcAllReturns, calculateAvgAndArea, CoinReturns, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import styles from './styles.module.less';

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
  const [averages, setAverages] = useState<undefined|CoinReturns[]>();
  const [progress, setProgress] = useState<number|undefined>(0);

  useEffect(() => {
    if (!snpData) return;
    let isCancelled = false;
    const cancellableProgress = (value: number) => {
      setProgress(value);
      return !isCancelled;
    }
    const allReturns = calcAllReturns(snpData, params, cancellableProgress);
    if (allReturns) {
      const averages = calculateAvgAndArea(allReturns, snpData, 1);
      setAverages(averages);
      setProgress(undefined);
    }
    return () => { isCancelled = true };
  }, [snpData])

  const maxGraphPoints = 12;
  return (
    <Segment className={styles.graphContainer}>
    <Header as="h4">
      <FormattedMessage {...translations.title} />
    </Header>
    <FormattedMessage {...translations.description} />
    {progress || !averages
      ? <GraphLoading percent={progress ?? 0.5 * 100} />
      : <AreaGraph maxGraphPoints={maxGraphPoints} data={averages} />
    }
    </Segment>
  );
};

const GraphLoading = ({percent}: {percent: number}) => (
  <>
    <Progress percent={percent} attached='top' />
    <Loader active inline='centered' />
    Crunching Numbers
    <Progress percent={percent} attached='bottom' />
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
