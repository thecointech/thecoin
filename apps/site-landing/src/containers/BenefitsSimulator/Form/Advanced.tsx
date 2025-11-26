import React, { type PropsWithChildren, useState } from 'react';
import { RangeFieldAndScale } from '../../../components/RangeFieldAndScale';
import { defineMessages, FormattedMessage, MessageDescriptor } from 'react-intl';
import { Props } from './types';
import { PeriodicalParams, ShockAbsorber, SimulationParameters } from '../simulator/params';
import styles from './styles.module.less';
import { Accordion, Icon } from 'semantic-ui-react';
import { basic } from './Basic';
import Decimal from 'decimal.js-light';

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
    description: 'Simulator: Yearly Income'
  },

  // Labels for additional credit parameters
  cashBackRate: {
    defaultMessage: 'Cashback Rate:',
    description: 'Simulator: How much cashback is earned on this credit card'
  },
  interestRate: {
    defaultMessage: 'Interest Rate:',
    description: 'Simulator: How much interest is charged on credit vard if we do not pay total due'
  },

  // Parameters for ShockAbsorber
  shockAbsorber: {
    defaultMessage: 'Shock Absorber:',
    description: 'Parameters for simulating the balance protection feature'
  },
  cushion: {
    defaultMessage: 'Drop Protect:',
    description: 'How much of a market drop would this account be protected from',
  },
  maximumProtected: {
    defaultMessage: 'Balance Protect:',
    description: 'The maximum balance to protect with shock absorber',
  }
});

const tooltips = {
  income: defineMessages({
    weekly: {
      defaultMessage: 'Regular weekly earnings, eg paycheques',
      description: 'Simulator Tooltip: Weekly Income'
    },
    monthly: {
      defaultMessage: 'Any income paid monthly, eg benefits or rent collected',
      description: 'Simulator Tooltip: Monthly Income'
    },
    yearly: {
      defaultMessage: 'Any income that arrives only once a year, eg bonuses',
      description: 'Simulator Tooltip: Yearly Income'
    },
  }),
  cash: defineMessages({
    weekly: {
      defaultMessage: 'Any weekly spending that cannot{br}be put on a credit card, eg babysitter',
      description: 'Simulator Tooltip: Weekly Cash',
      values: {br: "\n"},
    },
    monthly: {
      defaultMessage: 'Any monthly expenses that cannot{br}be put on a credit card, eg rent or bills',
      description: 'Simulator Tooltip: Monthly Cash',
      values: {br: "\n"},
    },
    yearly: {
      defaultMessage: 'Once-a-year expenses that cannot be put on a credit card',
      description: 'Simulator Tooltip: Yearly Cash'
    },
  }),
  credit: defineMessages({
    weekly: {
      defaultMessage: 'Any weekly spending that can be put{br}on a credit card, eg groceries and gas',
      description: 'Simulator Tooltip: Weekly Cash',
      values: {br: "\n"},
    },
    monthly: {
      defaultMessage: 'Any monthly expenses that can be{br}put on a credit card, eg gym memberships',
      description: 'Simulator Tooltip: Monthly Cash',
      values: {br: "\n"},
    },
    yearly: {
      defaultMessage: 'Once-a-year expenses that can be put on a credit card, eg vactions',
      description: 'Simulator Tooltip: Yearly Cash'
    },
  }),
  shockAbsorber: defineMessages({
    cushion: {
      defaultMessage: 'How big of a drop in the market will{br}be absorbed before you lose any money',
      description: 'Simulator Tooltip: shockabsorber cushion',
      values: {br: "\n"},
    },
    maximumProtected: {
      defaultMessage: 'The maximum amount protected by the shock-absorber.{br}The smaller this is, the faster your account grows on average,{br}but the worse it will do in during down periods',
      description: 'Simulator Tooltip: shockabsorber cushion',
      values: {br: "\n"},
    }
  }),
  ...defineMessages({
    cashBackRate: {
      defaultMessage: 'What percentage of spending does the credit card earn as cashback.',
      description: 'Simulator Tooltip: cashback'
    },
    interestRate: {
      defaultMessage: 'How much interest is charged on{br}any overdue amounts by the credit card.',
      description: 'Simulator Tooltip: cashback',
      values: {br: "\n"},
    }
  })
};

const UseStateWrapper = () => useState<number>(0)
type UseNumberState = ReturnType<typeof UseStateWrapper>;

export const Advanced = ({ params, setParams, years, setYears }: Props) => {

  const onChangedInObj = (name: keyof SimulationParameters) =>
    (val: any) => setParams((prev: SimulationParameters) => ({
      ...prev,
      [name]: val,
    }));

  const activeIdxState = useState(-1);

  return (
    <div className={styles.formPane} >
      <RangeFieldAndScale
        label={basic.startingValue}
        tooltip={basic.startingValueTooltip}
        scaleType="currency"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={onChangedInObj("initialBalance")}
      />
      <RangeFieldAndScale
        label={basic.rangeDuration}
        tooltip={basic.rangeDurationTooltip}
        scaleType="years"
        maximum={60}
        initial={years}
        onChange={v => setYears(Math.max(1, v))}
      />
      <Accordion className={styles.accordion}>
        <PeriodicalGroup
          title={translations.income}
          tooltips={tooltips.income}
          index={0}
          activeIndexState={activeIdxState}
          params={params.income}
          setParams={onChangedInObj("income")}
        />
        <PeriodicalGroup
          title={translations.credit}
          tooltips={tooltips.credit}
          index={1}
          activeIndexState={activeIdxState}
          params={params.credit}
          setParams={onChangedInObj("credit")}
        >
          <RangeFieldAndScale
            label={translations.cashBackRate}
            tooltip={tooltips.cashBackRate}
            scaleType="percent"
            maximum={0.05}
            step={0.01}
            initial={params.credit.cashBackRate}
            onChange={v => onChangedInObj("credit")({ ...params.credit, cashBackRate: v })}
          />
          <RangeFieldAndScale
            label={translations.interestRate}
            tooltip={tooltips.interestRate}
            scaleType="percent"
            maximum={1}
            step={0.01}
            initial={params.credit.interestRate}
            onChange={v => onChangedInObj("credit")({ ...params.credit, interestRate: v })}
          />

        </PeriodicalGroup>
        <PeriodicalGroup
          title={translations.cash}
          tooltips={tooltips.cash}
          index={2}
          activeIndexState={activeIdxState}
          params={params.cash}
          setParams={onChangedInObj("cash")}
        />
        <ShockAbsorberGroup
          title={translations.cash}
          index={3}
          activeIndexState={activeIdxState}
          params={params.shockAbsorber}
          setParams={onChangedInObj("shockAbsorber")}
        />
      </Accordion>
    </div>
  )
}

type GroupProps<T> = {
  title: MessageDescriptor;
  index: number;
  activeIndexState: UseNumberState;
  params: T;
  setParams: (v: T) => void;
}

type PeriodicalProps = GroupProps<PeriodicalParams> & {
  tooltips: typeof tooltips["income"],
}
const PeriodicalGroup = ({ tooltips, title, index, params, setParams, activeIndexState, children }: PropsWithChildren<PeriodicalProps>) => {

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
        className="ui"
      >
        <Icon name='dropdown' />
        <FormattedMessage {...title} />
      </Accordion.Title>
      <Accordion.Content active={active} >
        <RangeFieldAndScale
          label={translations.weekly}
          tooltip={tooltips.weekly}
          scaleType="currency"
          maximum={1000}
          step={1}
          initial={params.weekly}
          onChange={setNamedValue("weekly")}
        />
        <RangeFieldAndScale
          label={translations.monthly}
          tooltip={tooltips.monthly}
          scaleType="currency"
          maximum={1000}
          step={1}
          initial={params.monthly}
          onChange={setNamedValue("monthly")}
        />
        <RangeFieldAndScale
          label={translations.yearly}
          tooltip={tooltips.yearly}
          scaleType="currency"
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



const ShockAbsorberGroup: React.FC<GroupProps<ShockAbsorber>> = ({ index, params, setParams, activeIndexState }) => {

  const setNamedValue = (name: keyof ShockAbsorber) =>
    (val: any) => setParams({
      ...params,
      [name]: new Decimal(val),
    }
    )
  const active = activeIndexState[0] === index;
  const toggleActive = () => activeIndexState[1](
    activeIndexState[0] == index
      ? -1
      : index
  )

  const onSetCushion = (v: number) => {
    const d = new Decimal(v);
    setParams({
      ...params,
      cushionDown: d,
      cushionUp: d.div(9).add(0.01),
    })
  }
  return (
    <>
      <Accordion.Title
        active={activeIndexState[0] === index}
        index={0}
        onClick={toggleActive}
        className="ui"
      >
        <Icon name='dropdown' />
        <FormattedMessage {...translations.shockAbsorber} />
      </Accordion.Title>
      <Accordion.Content active={active} >
        <RangeFieldAndScale
          label={translations.cushion}
          tooltip={tooltips.shockAbsorber.cushion}
          scaleType="percent"
          maximum={0.5}
          step={0.1}
          initial={params.cushionDown.toNumber()}
          onChange={onSetCushion}
        />
        <RangeFieldAndScale
          label={translations.maximumProtected}
          tooltip={tooltips.shockAbsorber.maximumProtected}
          scaleType="currency"
          maximum={5000}
          step={100}
          initial={params.maximumProtected.toNumber()}
          onChange={setNamedValue('maximumProtected')}
        />
      </Accordion.Content>
    </>
  )
}
