import React, { Dispatch, SetStateAction } from 'react';
import { Button } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { SimulationParameters } from '../../ReturnProfile/data/params';
import { RangeFieldAndScale } from 'components/RangeFieldAndScale';
import styles from './styles.module.less';

const translations = defineMessages({
    startingValue : {
      defaultMessage: 'Starting value:',
      description: 'site.compare.label.rangeStarting: label for Starting Value in the compare page'},
    rangeDuration : {
      defaultMessage: 'Duration:',
      description: 'site.compare.label.rangeDuration: label for range duration in the compare page'},
    rangeDurationYear : {
      defaultMessage: 'Years',
      description: 'site.compare.label.rangeDurationYear: label for range Duration Year field in the compare page'},
    button : {
        defaultMessage: 'Show Me',
        description: 'site.compare.button: label for the button in the compare page'}
  });

type Props = {
  params: SimulationParameters;
  setParams: Dispatch<SetStateAction<SimulationParameters>>;
};

export const FormCompare = ({params, setParams}: Props) => {

  // TODO: Connect all o' dis
  const onChangeNamed = (name: keyof SimulationParameters) =>
    (val: any) => setParams((prev: SimulationParameters) => ({
      ...prev,
      [name]: val,
    }))

  return (
    <div id={styles.variablesContainer}>

      <RangeFieldAndScale
        label={translations.startingValue}
        scaleType="currency"
        currency="CAD"
        maximum={1000}
        step={1}
        initial={params.initialBalance}
        onChange={onChangeNamed("initialBalance")}
      />

      <RangeFieldAndScale
        label={translations.rangeDuration}
        scaleType="unit"
        maximum={60}
        onChange={v => onChangeNamed("maxDuration")({years: v})}
      />

      <Button secondary className={`${styles.buttonContainer} x16spaceBefore`}>
        <FormattedMessage {...translations.button} />
      </Button>
    </div>
  );
};
