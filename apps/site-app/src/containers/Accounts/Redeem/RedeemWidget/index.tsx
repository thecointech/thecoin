import * as React from 'react';
import { Form, Grid, Header, Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, defineMessages } from 'react-intl';

import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import interact from './images/icon_payment_big.svg';
import { UxInput } from '@thecointech/shared/components/UX/Input';
import { AccountState } from '@thecointech/account';
import { UxEmail } from '@thecointech/shared/components/UX';
import { invalidAnswer, invalidQuestion } from '@thecointech/utilities/VerifiedSale';
import { MessageWithValues } from '@thecointech/shared/types';


const translations = defineMessages({
  successMessage : {
      defaultMessage: 'Order received.\nYou should receive the e-Transfer in 1-2 business days.',
      description: 'app.accounts.redeem.successMessage: Success Message for the make a payment page / etransfer tab'},
  timeoutMessage: {
        defaultMessage: 'The transaction is in the queue, but processing it is taking longer than usual. Please be patient, the order will be processed shortly.',
        description: 'app.accounts.redeem.timeout: Timeout for the make a payment page / etransfer tab'},
  description : {
      defaultMessage: 'Email money to anyone with an interac e-Transfer.',
      description: 'app.accounts.redeem.description: Description for the make a payment page / etransfert tab'},
  emailLabel : {
      defaultMessage: 'Recipient email',
      description: 'app.accounts.redeem.form.emailLabel: Label for the form the make a payment page / etransfert tab'},
  emailDesc : {
      defaultMessage: 'An email address to send the e-Transfer to',
      description: 'app.accounts.redeem.form.emailDesc: Label for the form the make a payment page / etransfert tab'},
  questionLabel : {
      defaultMessage: 'Security question',
      description: 'app.accounts.redeem.form.questionLabel: Label for the form the make a payment page / etransfert tab'},
  answerLabel : {
      defaultMessage: 'Security answer',
      description: 'app.accounts.redeem.form.answerLabel: Label for the form the make a payment page / etransfert tab'},
  messageLabel : {
      defaultMessage: 'Message (optional)',
      description: 'app.accounts.redeem.form.messageLabel: Label for the form the make a payment page / etransfert tab'},
  messageDesc : {
      defaultMessage: 'An optional message to the recipient',
      description: 'Placeholder text for optional message to be included in e-transfer'},
  messageTooltip: {
    defaultMessage: 'Should not include the security answer',
    description: 'tooltip for optional message to be included in e-transfer'},
  entryIsRequired : {
      defaultMessage: 'This field is required',
      description: 'Error on attempted submission without completing field'},
  entryTooShort: {
    defaultMessage: 'This entry needs to be at least {count} letters long',
    description: 'Error on attempted submission without completing field'},

  noSpecialCaractDesc : {
      defaultMessage: 'No numbers or special characters',
      description: 'app.accounts.redeem.form.noSpecialCaractDesc: Label for the form the make a payment page / etransfert tab'},
  invalidCharacters : {
      defaultMessage: 'Invalid characters are: < or >, \'{ or }\', [ or ], %, &, #, \\ or "',
      description: 'app.accounts.redeem.form.noSpecialCaractDesc: Label for the form the make a payment page / etransfert tab'},
  containsInvalidCharacters : {
        defaultMessage: 'The following invalid characters were found: {chars}',
        description: 'error message on invalid characters'},
  transferOutHeader : {
      defaultMessage: 'Processing Transfer out...',
      description: 'app.accounts.redeem.transferOutHeader: Message for the form the make a payment page / etransfert tab'},
  button : {
      defaultMessage: 'Send e-Transfer',
      description: 'app.accounts.redeem.form.button: For the button in the make a payment page / etransfer tab'}
});

type VisualProps={

    errorHidden: boolean,
    successHidden: boolean,
    timedout?: boolean,

    coinToSell: number | null,
    onValueChange: (value: number) => void,
    account: AccountState | undefined,
    rate: number,

    setEmail: (value?: string) => void,
    setQuestion: (value?: string) => void,
    setAnswer: (value?: string) => void,
    setMessage: (value?: string) => void,
    forceValidate: boolean,
    resetToDefault: number;

    onSubmit: StrictButtonProps["onClick"],

    cancelCallback: () => void,
    transferInProgress: boolean,
    percentComplete: number,
    transferMessage: MessageWithValues,

    errorMessage?: MessageWithValues,
};

const validateChars = (re: () => RegExp, minimumLength: number) => (value: string) => {
  if (minimumLength > 0 && !value?.length) {
    return translations.entryIsRequired;
  }
  if (value.length < minimumLength) {
    return {
      ...translations.entryTooShort,
      values: {
        count: minimumLength
      }
    }
  }
  const match = re().exec(value);
  return match
    ? {
        ...translations.containsInvalidCharacters,
        values: {
          chars: match.map(c => c.replace(' ', "(space)")).join(', ')
        }
      }
    : null;
}
const validateAnswer = validateChars(invalidAnswer, 3);
const validateQuestion = validateChars(invalidQuestion, 3);
const validateMessage = validateChars(invalidQuestion, 0);

export const RedeemWidget = (props: VisualProps) => {
  const commonProps = {
    resetToDefault: props.resetToDefault,
    forceValidate: props.forceValidate,
  }
  return (
    <React.Fragment>
      <Form>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Header as="h5">
                <Header.Subheader>
                  <FormattedMessage {...translations.description} />
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column floated='right' width={4}>
              <img src={interact} />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Message hidden={props.successHidden} positive>
          <FormattedMessage {...translations.successMessage} />
        </Message>
        {props.errorMessage && (
          <Message hidden={props.errorHidden} negative>
            <FormattedMessage {...props.errorMessage} />
          </Message>
        )}
        <Message hidden={!props.timedout}>
          <FormattedMessage {...translations.timeoutMessage} />
        </Message>

        <DualFxInput
          onChange={props.onValueChange}
          asCoin={true}
          maxValue={props.account!.balance}
          value={props.coinToSell}
          fxRate={props.rate}
        />
        <UxEmail
            className={"borderTop borderBottom"}
            onValue={props.setEmail}
            {...commonProps}
        />
        <UxInput
            className={"half left"}
            intlLabel={translations.questionLabel}
            onValue={props.setQuestion}
            onValidate={validateQuestion}
            placeholder={translations.noSpecialCaractDesc}
            tooltip={translations.invalidCharacters}
            {...commonProps}
          />
        <UxInput
            className={"half right"}
            intlLabel={translations.answerLabel}
            onValue={props.setAnswer}
            onValidate={validateAnswer}
            placeholder={translations.noSpecialCaractDesc}
            tooltip={translations.invalidCharacters}
            {...commonProps}
          />
        <UxInput
            className={"borderTop"}
            onValidate={validateMessage}
            intlLabel={translations.messageLabel}
            onValue={props.setMessage}
            placeholder={translations.messageDesc}
            tooltip={translations.messageTooltip}
            type="text"
            {...commonProps}
          />
        <ButtonTertiary className={"x4spaceBefore x2spaceAfter"} onClick={props.onSubmit} >
          <FormattedMessage {...translations.button} />
        </ButtonTertiary>
      </Form>
      <ModalOperation
        cancelCallback={props.cancelCallback}
        isOpen={props.transferInProgress}
        header={translations.transferOutHeader}
        progressMessage={props.transferMessage}
        progressPercent={props.percentComplete}
      />
    </React.Fragment>
  );
}
