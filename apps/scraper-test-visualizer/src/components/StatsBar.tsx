import React from 'react';
import { Statistic } from 'semantic-ui-react';
import type { FailingTest, Test } from '../types';
import { TestsReducer } from '../state/reducer';
import styles from './StatsBar.module.less';

interface StatsBarProps {
  tests: Test[];
  failingTests: FailingTest[];
}

const StatsBar: React.FC<StatsBarProps> = ({ tests, failingTests }) => {
  const totalTests = tests.length;
  const failingCount = failingTests.length;
  const passingCount = totalTests - failingCount;
  const actions = TestsReducer.useApi();
  // const totalRuns = tests.reduce((sum, test) => sum + test.groups.length, 0);

  return (
    <div className={styles.statsBar}>
      <Statistic size="small">
        <Statistic.Value>{totalTests}</Statistic.Value>
        <Statistic.Label>Total Tests</Statistic.Label>
      </Statistic>

      <Statistic size="small" color="green">
        <Statistic.Value>{passingCount}</Statistic.Value>
        <Statistic.Label>Passing</Statistic.Label>
      </Statistic>

      <Statistic
        size="small"
        color="red"
        onClick={() => actions.setFilter('failing')}
        style={{ cursor: 'pointer' }}
      >
        <Statistic.Value>{failingCount}</Statistic.Value>
        <Statistic.Label>Failing</Statistic.Label>
      </Statistic>

      {/* <Statistic size="small" color="blue">
        <Statistic.Value>{totalRuns}</Statistic.Value>
        <Statistic.Label>Total Runs</Statistic.Label>
      </Statistic> */}
    </div>
  );
};

export default StatsBar;
