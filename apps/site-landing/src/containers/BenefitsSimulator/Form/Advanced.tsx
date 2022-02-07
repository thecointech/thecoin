import React from 'react';
import { RangeFieldAndScale } from '../../../components/RangeFieldAndScale';
import { defineMessages } from 'react-intl';
import { Props } from './types';
import { debounce } from 'lodash';
import { PeriodicalParams, SimulationParameters } from '../../ReturnProfile/data/params';
import styles from './styles.module.less';
import { Accordion } from 'semantic-ui-react';

const translations = defineMessages({
  startingValue : {
    defaultMessage: 'Initial Balance:',
    description: 'Simulator: Initial Balance'},

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


  rangeDuration : {
    defaultMessage: 'Duration:',
    description: 'site.compare.label.rangeDuration: label for range duration in the compare page'},
});

const panels = [
  {
    key: 'what-is-dog',
    title: 'What is a dog?',
    content: [
      'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome',
      'guest in many households across the world.',
    ].join(' '),
  },
  {
    key: 'kinds-of-dogs',
    title: 'What kinds of dogs are there?',
    content: [
      'There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a breed of dog',
      'that they find to be compatible with their own lifestyle and desires from a companion.',
    ].join(' '),
  },
  {
    key: 'acquire-dog',
    title: 'How do you acquire a dog?',
    content: {
      content: (
        <div>
          <p>
            Three common ways for a prospective owner to acquire a dog is from
            pet shops, private owners, or shelters.
          </p>
          <p>
            A pet shop may be the most convenient way to buy a dog. Buying a dog
            from a private owner allows you to assess the pedigree and
            upbringing of your dog before choosing to take it home. Lastly,
            finding your dog from a shelter, helps give a good home to a dog who
            may not find one so readily.
          </p>
        </div>
      ),
    },
  },
]

const AccordionExampleStandardShorthand = () => (
  <Accordion defaultActiveIndex={0} panels={panels} />
)

export const Advanced = ({ params, setParams, years, setYears }: Props) => {

  const debounceInterval = 250;
  const dbOnChangeNamed = (name: keyof SimulationParameters) =>
    debounce((val: any) => setParams((prev: SimulationParameters) => ({
      ...prev,
      [name]: val,
    })), debounceInterval);


  const dbOnSetYears = debounce(v => setYears(Math.max(1, v)), debounceInterval);

  const panels = [
    {
      key: 'what-is-dog',
      title: 'What is a dog?',
      content: [
        'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome',
        'guest in many households across the world.',
      ].join(' '),
    },

    // {
    //   key: 'income-periods',
    //   title: 'Income',
    //   content: <Group params={params.income} setParams={dbOnChangeNamed("income")} />,
    // },
    // {
    //   key: 'cash-periods',
    //   title: 'Cash',
    //   content: <Group params={params.cash} setParams={dbOnChangeNamed("cash")} />,
    // },
    // {
    //   key: 'credit-periods',
    //   title: 'Credit',
    //   content: <Group params={params.credit} setParams={dbOnChangeNamed("credit")} />,
    // },
  ]

  return <AccordionExampleStandardShorthand />

  // return (
  //   <div className={styles.formPane} >
  //     <RangeFieldAndScale
  //       label={translations.startingValue}
  //       scaleType="currency"
  //       currency="CAD"
  //       maximum={1000}
  //       step={1}
  //       initial={params.initialBalance}
  //       onChange={dbOnChangeNamed("initialBalance")}
  //     />
  //     <RangeFieldAndScale
  //       label={translations.rangeDuration}
  //       scaleType="unit"
  //       unit="year"
  //       maximum={60}
  //       initial={years}
  //       onChange={dbOnSetYears}
  //     />
  //     <div>
  //       <AccordionExampleStandardShorthand />
  //     </div>
  //   </div>
  // )
}


type GroupParams = {
  params: PeriodicalParams,
  setParams: (v: PeriodicalParams) => void
}
const Group = ({params, setParams}: GroupParams) => {

  const setNamedValue = (name: keyof PeriodicalParams) =>
    (val: any) => setParams({
      ...params,
      [name]: val,
    }
  )
  return (
    <>
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
    </>
  )
}

