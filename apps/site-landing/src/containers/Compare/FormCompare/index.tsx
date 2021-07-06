import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { RangeFieldAndScale } from '@thecointech/site-base/components/RangeFieldAndScale';

import styles from './styles.module.less';

const translations = defineMessages({
    labelStartingValueText : {
      defaultMessage: 'Starting value:',
      description: 'site.compare.label.rangeStarting: label for Starting Value in the compare page'},
    labelStartingValueCurrencyText : {
      defaultMessage: 'CAD',
      description: 'site.compare.label.rangeStartingCurrency: label for Starting Value Currency Text field in the compare page'},
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

export const FormCompare = () => {

    const intl = useIntl();
    const labelStartingValue = intl.formatMessage(translations.labelStartingValueText);
    const labelStartingValueCurrency = intl.formatMessage(translations.labelStartingValueCurrencyText);
    const scaleStartingType = "currency";
    const minRangeStartingValue = 1000;
    const maxRangeStartingValue = 100000;
    const stepRangeStartingValue = 100;
    const minRangeScaleStartingValue = 1000;
    const medRangeScaleStartingValue = 5000;
    const maxRangeScaleStartingValue = 100000;

    const labelDurationValue = intl.formatMessage(translations.rangeDuration);
    const labelDurationYear = intl.formatMessage(translations.rangeDurationYear);
    const scaleDurationType = "unit";
    const minRangeDurationValue = 1;
    const maxRangeDurationValue = 80;
    const stepRangeDurationValue = 1;
    const minRangeScaleDurationValue = 1;
    const medRangeScaleDurationValue = 40;
    const maxRangeScaleDurationValue = 80;

    return (
      <div id={styles.variablesContainer}>

        <RangeFieldAndScale
            labelValue={labelStartingValue}
            labelValueCurrency={labelStartingValueCurrency}
            scaleType={scaleStartingType}
            minRange={minRangeStartingValue}
            maxRange={maxRangeStartingValue}
            stepRange={stepRangeStartingValue}
            minRangeScale={minRangeScaleStartingValue}
            medRangeScale={medRangeScaleStartingValue}
            maxRangeScale={maxRangeScaleStartingValue}/>

        <RangeFieldAndScale
            labelValue={labelDurationValue}
            labelValueCurrency={labelDurationYear}
            scaleType={scaleDurationType}
            minRange={minRangeDurationValue}
            maxRange={maxRangeDurationValue}
            stepRange={stepRangeDurationValue}
            minRangeScale={minRangeScaleDurationValue}
            medRangeScale={medRangeScaleDurationValue}
            maxRangeScale={maxRangeScaleDurationValue}/>

        <Button secondary className={ `${styles.buttonContainer} x16spaceBefore` }>
          <FormattedMessage {...translations.button} />
        </Button>
      </div>
    );
};
