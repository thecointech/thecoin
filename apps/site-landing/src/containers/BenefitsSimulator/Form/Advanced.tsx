import React, { useState } from 'react';
import { RangeFieldAndScale } from '../../../components/RangeFieldAndScale';
import { defineMessages, FormattedMessage, MessageDescriptor } from 'react-intl';
import { Props } from './types';
import { debounce } from 'lodash';
import { PeriodicalParams, SimulationParameters } from '../../ReturnProfile/data/params';
import styles from './styles.module.less';
import { Accordion, Icon } from 'semantic-ui-react';
import { basic } from './Basic';

const translations = defineMessages({

  // Labels for period groups
  income: {
    defaultMessage: 'Income:',
    description: 'Simulator: Parameters for sim income'
  },
  cash: {
    defaultMessage: 'Cash Spending:',
    description: 'Simulator: parameters for cash-based spending'
  },
  credit: {
    defaultMessage: 'Credit Spending:',
    description: 'Simulator: parameters for credit-based spending'
  },

  // Labels for periodical parameters
  weekly: {
    defaultMessage: 'Weekly:',
    description: 'Simulator: Weekly Income'
  },
  monthly: {
    defaultMessage: 'Monthly:',
    description: 'Simulator: Monthly Income'
  },
  yearly: {
    defaultMessage: 'Yearly:',
    description: 'Simulator: Weekly Income'
  },

  // Labels for additional credit parameters
  cashBackRate: {
    defaultMessage: 'Cashback Rate:',
    description: 'Simulator: How much cashback is earned on this credit card'
  },
  interestRate: {
    defaultMessage: 'Interest Rate:',
    description: 'Simulator: How much interest is charged on credit vard if we do not pay total due'
  }
});

const UseStateWrapper = () => useState<number>(0)
type UseNumberState = ReturnType<typeof UseStateWrapper>;

const debounceInterval = 250;

export const Advanced = ({ params, setParams, years, setYears }: Props) => {

  const onChangedInObj = (name: keyof SimulationParameters) =>
    debounce((val: any) => setParams((prev: SimulationParameters) => ({
      ...prev,
      [name]: val,
    })), debounceInterval);

  const activeIdxState = useState(-1);
  const dbOnSetYears = debounce(v => setYears(Math.max(1, v)), debounceInterval);

  return (
    <div className={styles.formPane} >
      <RangeFieldAndScale
        label={basic.startingValue}
        scaleType="currency"
        currency="CAD"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={onChangedInObj("initialBalance")}
      />
      <RangeFieldAndScale
        label={basic.rangeDuration}
        scaleType="unit"
        unit="year"
        maximum={60}
        initial={years}
        onChange={dbOnSetYears}
      />
      <Accordion>
        <PeriodicalGroup
          title={translations.income}
          index={0}
          activeIndexState={activeIdxState}
          params={params.income}
          setParams={onChangedInObj("income")}
        />
        <PeriodicalGroup
          title={translations.credit}
          index={1}
          activeIndexState={activeIdxState}
          params={params.credit}
          setParams={onChangedInObj("credit")}
        >
          <RangeFieldAndScale
            label={translations.cashBackRate}
            scaleType="percent"
            maximum={0.05}
            step={0.01}
            initial={params.credit.cashBackRate}
            onChange={v => onChangedInObj("credit")({ ...params.credit, cashBackRate: v })}
          />
          <RangeFieldAndScale
            label={translations.interestRate}
            scaleType="percent"
            maximum={1}
            step={0.01}
            initial={params.credit.interestRate}
            onChange={v => onChangedInObj("credit")({ ...params.credit, interestRate: v })}
          />

        </PeriodicalGroup>
        <PeriodicalGroup
          title={translations.cash}
          index={2}
          activeIndexState={activeIdxState}
          params={params.cash}
          setParams={onChangedInObj("cash")}
        />
      </Accordion>
    </div>
  )
}

type GroupProps = {
  title: MessageDescriptor;
  index: number;
  activeIndexState: UseNumberState;
  params: PeriodicalParams;
  setParams: (v: PeriodicalParams) => void;
}

const PeriodicalGroup: React.FC<GroupProps> = ({ title, index, params, setParams, activeIndexState, children }) => {

  const setNamedValue = (name: keyof PeriodicalParams) =>
    (val: any) => setParams({
      ...params,
      [name]: val,
    }
    )
  const active = activeIndexState[0] === index;
  const toggleActive = () => activeIndexState[1](
    activeIndexState[0] == index
      ? -1
      : index
  )
  return (
    <>
      <Accordion.Title
        active={activeIndexState[0] === index}
        index={0}
        onClick={toggleActive}
      >
        <Icon name='dropdown' />
        <FormattedMessage {...title} />
      </Accordion.Title>
      <Accordion.Content active={active} >
        <RangeFieldAndScale
          label={translations.weekly}
          scaleType="currency"
          currency="CAD"
          maximum={1000}
          step={1}
          initial={params.weekly}
          onChange={setNamedValue("weekly")}
        />
        <RangeFieldAndScale
          label={translations.monthly}
          scaleType="currency"
          currency="CAD"
          maximum={1000}
          step={1}
          initial={params.monthly}
          onChange={setNamedValue("monthly")}
        />
        <RangeFieldAndScale
          label={translations.yearly}
          scaleType="currency"
          currency="CAD"
          maximum={1000}
          step={1}
          initial={params.yearly}
          onChange={setNamedValue("yearly")}
        />
        {children}
      </Accordion.Content>
    </>
  )
}
