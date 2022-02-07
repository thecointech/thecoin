import React from 'react';
import { defineMessages } from 'react-intl';
import { RangeFieldAndScale } from 'components/RangeFieldAndScale';
import { debounce } from 'lodash';
import { createParams } from '../../ReturnProfile/data/params';
import { Props } from './types';
import styles from './styles.module.less';

const translations = defineMessages({
  startingValue: {
    defaultMessage: 'Starting value:',
    description: 'site.compare.label.rangeStarting: label for Starting Value in the compare page',
  },
  rangeDuration: {
    defaultMessage: 'Duration:',
    description: 'site.compare.label.rangeDuration: label for range duration in the compare page',
  },
});

export const FormCompare = ({
  params, setParams, years, setYears,
}: Props) => {
  const debounceInterval = 250;
  const dbOnInitialChange = debounce(
    (val: number) => setParams(createParams({initialBalance: val})),
    debounceInterval
  );
  const dbOnSetYears = debounce(
    v => setYears(Math.max(1, v)),
    debounceInterval
  );

  return (
    <div className={styles.formPane} >

      <RangeFieldAndScale
        label={translations.startingValue}
        className="x6spaceBefore"
        scaleType="currency"
        currency="CAD"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={dbOnInitialChange}
      />

      <RangeFieldAndScale
        label={translations.rangeDuration}
        className="x6spaceBefore"
        scaleType="unit"
        unit="year"
        maximum={60}
        initial={years}
        onChange={dbOnSetYears}
      />

    </div>
  );
}
