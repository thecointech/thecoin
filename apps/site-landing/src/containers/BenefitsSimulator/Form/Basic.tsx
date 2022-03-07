import React from 'react';
import { defineMessages } from 'react-intl';
import { RangeFieldAndScale } from 'components/RangeFieldAndScale';
import { createParams } from '../simulator/params';
import { Props } from './types';
import styles from './styles.module.less';

export const basic = defineMessages({
  startingValue: {
    defaultMessage: 'Initial Deposit:',
    description: 'site.compare.label.rangeStarting: label for Starting Value in the compare page',
  },
  startingValueTooltip: {
    defaultMessage: 'The value of the initial deposit when opening an account',
    description: 'sim form StartingValue tooltip ',
  },
  rangeDuration: {
    defaultMessage: 'Duration:',
    description: 'site.compare.label.rangeDuration: label for range duration in the compare page',
  },
  rangeDurationTooltip: {
    defaultMessage: 'How many years to run the simulation for',
    description: 'sim form rangeDuration tooltip ',
  },
});

export const Basic = ({params, setParams, years, setYears}: Props) =>
  <div className={styles.formPane} >

    <RangeFieldAndScale
      label={basic.startingValue}
      tooltip={basic.startingValueTooltip}
      className="x6spaceBefore"
      scaleType="currency"
      maximum={1000}
      step={1}
      initial={params.initialBalance}
      onChange={v => setParams(createParams({ initialBalance: v }))}
    />

    <RangeFieldAndScale
      label={basic.rangeDuration}
      tooltip={basic.rangeDurationTooltip}
      className="x6spaceBefore"
      scaleType="years"
      maximum={60}
      initial={years}
      onChange={v => setYears(Math.max(1, v))}
    />

  </div>
