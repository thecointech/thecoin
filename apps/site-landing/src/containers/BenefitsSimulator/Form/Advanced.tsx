import React from 'react';
import { RangeFieldAndScale } from '../../../components/RangeFieldAndScale';
import { defineMessages } from 'react-intl';
import { Props } from './types';
import { debounce } from 'lodash';
import { SimulationParameters } from '../../ReturnProfile/data/params';
import styles from './styles.module.less';

const translations = defineMessages({
  startingValue : {
    defaultMessage: 'An Advanced Starting value:',
    description: 'site.compare.label.rangeStarting: label for Starting Value in the compare page'},
  rangeDuration : {
    defaultMessage: 'Duration:',
    description: 'site.compare.label.rangeDuration: label for range duration in the compare page'},
});

export const Advanced = ({ params, setParams, years, setYears }: Props) => {
  const debounceInterval = 250;
  const dbOnChangeNamed = (name: keyof SimulationParameters) =>
    debounce((val: any) => setParams((prev: SimulationParameters) => ({
      ...prev,
      [name]: val,
    })), debounceInterval);

  const dbOnSetYears = debounce(v => setYears(Math.max(1, v)), debounceInterval);

  return (
    <div className={styles.formPane} >
      <RangeFieldAndScale
        label={translations.startingValue}
        scaleType="currency"
        currency="CAD"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={dbOnChangeNamed("initialBalance")}
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
  )
}



