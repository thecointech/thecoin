import React from "react"
import { useIntl, type FormattedMessage } from "react-intl"

export const FormattedMessageWithBreaks = (props: React.ComponentProps<typeof FormattedMessage>) => {
  const { values, ...rest } = props;
  const intl = useIntl();
  const message = intl.formatMessage(rest, { ...values, br: '\n' });
  const parts = (typeof message === 'string' ? message : String(message)).split('\n');
  return <>
    {parts.map((part, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {part}
      </React.Fragment>
    ))}
  </>;
}
