import React from "react"
import { FormattedMessage } from "react-intl"

export const FormattedMessageWithBreaks = (props: React.ComponentProps<typeof FormattedMessage>) => {
  const { values, ...rest } = props;
  return (
    <FormattedMessage {...rest} values={{ ...values, br: <br /> }} />
  )
}
