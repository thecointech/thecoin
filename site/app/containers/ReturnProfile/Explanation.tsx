import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

interface Props {
  timeString: React.ReactNode;
}

export const Explanation = (props: Props) => (
  <>
    <p>
      <FormattedMessage {...messages.explanationPara1} />
      {props.timeString}
    </p>
    <p>
      <FormattedMessage {...messages.explanationPara2} />
    </p>
  </>
  );