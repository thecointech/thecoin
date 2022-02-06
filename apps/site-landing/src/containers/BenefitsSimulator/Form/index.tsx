import React, { Dispatch, SetStateAction } from 'react';
import { Button } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { RangeFieldAndScale } from 'components/RangeFieldAndScale';
import { debounce } from 'lodash';
import { SimulationParameters } from '../../ReturnProfile/data/params';
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
  rangeDurationYear: {
    defaultMessage: 'Years',
    description: 'site.compare.label.rangeDurationYear: label for range Duration Year field in the compare page',
  },
});

type Props = {
  params: SimulationParameters;
  setParams: Dispatch<SetStateAction<SimulationParameters>>;
  years: number,
  setYears: Dispatch<SetStateAction<number>>;
};

export const FormCompare = ({
  params, setParams, years, setYears,
}: Props) => {
  const debounceInterval = 250;
  const dbOnChangeNamed = (name: keyof SimulationParameters) => debounce((val: any) => setParams((prev: SimulationParameters) => ({
    ...prev,
    [name]: val,
  })), debounceInterval);

  const dbOnSetYears = debounce(v => setYears(Math.max(1, v)), debounceInterval);

  return (
    <div id={styles.variablesContainer}>

      <RangeFieldAndScale
        label={translations.startingValue}
        scaleType="currency"
        currency="CAD"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={dbOnChangeNamed('initialBalance')}
      />

      <RangeFieldAndScale
        label={translations.rangeDuration}
        scaleType="unit"
        unit="year"
        maximum={60}
        initial={years}
        onChange={dbOnSetYears}
      />

    </div>
  );
};
