import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

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

export const FormCompare = () => {

  return (
    <div id={styles.variablesContainer}>

      <RangeFieldAndScale
        label={translations.startingValue}
        scaleType="currency"
        maximum={1000}
        step={1}
      />

      <RangeFieldAndScale
        label={translations.rangeDuration}
        scaleType="unit"
        maximum={60}
      />

      <Button secondary className={`${styles.buttonContainer} x16spaceBefore`}>
        <FormattedMessage {...translations.button} />
      </Button>
    </div>
  );
};
