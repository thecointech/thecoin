import React from "react"
import { defineMessages, FormattedMessage } from "react-intl"
import { Message, SemanticCOLORS } from "semantic-ui-react"

export enum Result {
  Initial,
  Invalid,
  Error,
  Success,
};

const translations = defineMessages({
  invalid : {
    defaultMessage: 'Please enter a valid email',
    description: 'site.subscribe.email.invalid: Message we give a user when the subscription failed'},
  error : {
    defaultMessage: 'Signup failed: please contact support@thecoin.io',
    description: 'site.subscribe.error: Message we give a user when the subscription failed (already subscribed or server)'},
  success : {
    defaultMessage: 'Success: check your emails',
    description: 'site.subscribe.success: Message we give a user when the subscription is a success'}
});

const ResultsMessages = {
  [Result.Invalid]: {
    color: 'orange' as SemanticCOLORS,
    ...translations.invalid,
  },
  [Result.Error]: {
    color: 'red' as SemanticCOLORS,
    ...translations.error,
  },
  [Result.Success]: {
    color: 'olive' as SemanticCOLORS,
    ...translations.success,
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
