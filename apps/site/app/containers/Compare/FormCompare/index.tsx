import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RangeFieldAndScale } from 'components/RangeFieldAndScale';

import styles from './styles.module.less';

export const FormCompare = () => {

    const intl = useIntl();
    const labelStartingValue = intl.formatMessage({ id: 'site.compare.label.rangeStarting', defaultMessage:'Starting value:'});
    const labelStartingValueCurrency = intl.formatMessage({ id: 'site.compare.label.rangeStartingCurrency', defaultMessage:'CAD'});
    const scaleStartingType = "currency";
    const minRangeStartingValue = 1000;
    const maxRangeStartingValue = 100000;
    const stepRangeStartingValue = 100;
    const minRangeScaleStartingValue = 1000;
    const medRangeScaleStartingValue = 5000;
    const maxRangeScaleStartingValue = 100000;

    const labelDurationValue = intl.formatMessage({ id: 'site.compare.label.rangeDuration', defaultMessage:'Duration:'});
    const labelDurationYear = intl.formatMessage({ id: 'site.compare.label.rangeDurationYear', defaultMessage:' Years'});
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
          <FormattedMessage id="site.compare.button" 
                            defaultMessage="Show Me" 
                            description="Button for the graph page" />
        </Button>
      </div>
    );
};
