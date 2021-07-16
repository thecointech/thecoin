import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  explanationPara1: {
    defaultMessage: 'This graph shows how The Coin account values will probably grow after ',
  },
  explanationPara2: {
    defaultMessage: 'If you opened an account at a random date any time in the past 80 years, the bottom axis shows the possible account values and the vertical axis is the probablility you would get that return',
  }
});

interface Props {
  timeString: React.ReactNode;
}

export const Explanation = (props: Props) => (
  <>
    <p>
      <FormattedMessage {...translations.explanationPara1} />
      {props.timeString}
    </p>
    <p>
      <FormattedMessage {...translations.explanationPara2} />
    </p>
  </>
  );