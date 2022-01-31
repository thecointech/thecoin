import React from 'react';
import { Header, Loader } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AreaGraph } from '../../AreaGraph';
import { calcAllReturns, calculateAvgAndArea, MarketData, SimulationParameters } from '../../ReturnProfile/data';
import styles from './styles.module.less';
import { isEqual } from 'lodash';

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
  fxData: MarketData[],
  snpData: MarketData[],
}

// TODO: This component does a lot of computation, and should be memoized
const GraphCompareLoaded = ({params, snpData}: Props) => {

  // These 3 lines hide a lot of computation
  const allReturns = calcAllReturns(snpData, params);
  const averages = calculateAvgAndArea(allReturns, snpData, 1);
  const maxGraphPoints = 12;

  return (
    <div className={styles.graphContainer}>
        <Header as="h4">
          <FormattedMessage {...translations.title} />
        </Header>
        <FormattedMessage {...translations.description} />
        <AreaGraph maxGraphPoints={maxGraphPoints} data={averages} />
    </div>
  );
};

const MemoizedGraphCompare = React.memo(GraphCompareLoaded, (a, b) => (
  a.fxData === b.fxData &&
  a.snpData === b.snpData &&
  isEqual(a.params, b.params)
))

export const GraphCompare = ({params, fxData, snpData}: Partial<Props>) =>
  (params && snpData && fxData)
    ? <MemoizedGraphCompare params={params} fxData={fxData} snpData={snpData} />
    : <Loader active inline='centered' />
