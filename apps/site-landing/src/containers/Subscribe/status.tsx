import React from "react"
import { FormattedMessage } from "react-intl"
import { Message, SemanticCOLORS } from "semantic-ui-react"

export enum Result {
  Initial,
  Invalid,
  Error,
  Success,
};

const ResultsMessages = {
  [Result.Invalid]: {
    color: 'orange' as SemanticCOLORS,
    id:"site.subscribe.email.invalid",
    defaultMessage:"Please enter a valid email",
    description:"Message we give a user when the subscription failed"
  },
  [Result.Error]: {
    color: 'red' as SemanticCOLORS,
      id:"site.subscribe.email.error",
      defaultMessage:"Signup failed: please contact support@thecoin.io",
      description:"Message we give a user when the subscription failed (already subscribed or server)",
  },
  [Result.Success]: {
    color: 'olive' as SemanticCOLORS,
      id:"site.subscribe.email.success",
      defaultMessage:"Success: check your emails",
      description: "Message we give a user when the subscription is a success"
  }
}

export const StatusMessage = ({ result }: { result: Result }) =>
  result === Result.Initial
    ? null
    : <div>
        <Message color={ResultsMessages[result].color}>
          <FormattedMessage {...ResultsMessages[result]} />
        </Message>
      </div>
