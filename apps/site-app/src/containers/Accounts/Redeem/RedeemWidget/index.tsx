import * as React from 'react';
import { Form, Grid, Header, Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import interact from './images/icon_payment_big.svg';
import { AccountState } from '@thecointech/shared/containers/Account';
import { UxInput } from '@thecointech/shared/components/UxInput';
import { ValuedMessageDesc } from '@thecointech/shared/components/UxInput/types';

type VisualProps={

    errorMessage: MessageDescriptor,
    errorHidden: boolean,
    successMessage: MessageDescriptor,
    successHidden: boolean,

    coinToSell: number | null,
    description:MessageDescriptor,
    onValueChange: (value: number) => void,
    account: AccountState | null,
    rate: number,

    emailLabel: MessageDescriptor,
    setEmail: (event: string) => void,
    emailDes: string,

    questionLabel: MessageDescriptor,
    setQuestion: (event: string) => void,
    noSpecialCaractDesc: string,

    answerLabel: MessageDescriptor,
    setAnswer: (event: string) => void,

    messageLabel: MessageDescriptor,
    setMessage: (event: string) => void,
    messageDesc: string,

    button: MessageDescriptor,
    onSubmit: StrictButtonProps["onClick"],

    cancelCallback: () => void,
    transferInProgress: boolean,
    transferOutHeader: MessageDescriptor | undefined,
    transferMessage: MessageDescriptor | undefined,
    percentComplete: number,
    transferValues: string,

    isValid: boolean,
    forceValidate: boolean,
    validationMessage: ValuedMessageDesc | null
};
  

export const RedeemWidget = (props: VisualProps) => {
  return (
    <React.Fragment>
      <Form>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Header as="h5">
                <Header.Subheader>
                  <FormattedMessage {...props.description} />
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column floated='right' width={4}>
              <img src={interact} />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Message hidden={props.successHidden} positive>
          <FormattedMessage {...props.successMessage} />
        </Message>
        <Message hidden={props.errorHidden} negative>
          <FormattedMessage {...props.errorMessage} />
        </Message>

        <DualFxInput
          onChange={props.onValueChange}
          asCoin={true}
          maxValue={props.account!.balance}
          value={props.coinToSell}
          fxRate={props.rate}
        />
        <UxInput
            className={"borderTop borderBottom"}
            intlLabel={props.emailLabel}
            uxChange={props.setEmail}
            placeholder={props.emailDes}
            name="email"
          />
        <UxInput
            className={"half left"}
            intlLabel={props.questionLabel}
            uxChange={props.setQuestion}
            placeholder={props.noSpecialCaractDesc}
            name="question"
          />
        <UxInput
            className={"half right"}
            intlLabel={props.answerLabel}
            uxChange={props.setAnswer}
            placeholder={props.noSpecialCaractDesc}
            name="answer"
          />
        <UxInput
            className={"borderTop"}
            intlLabel={props.messageLabel}
            uxChange={props.setMessage}
            placeholder={props.messageDesc}
            name="message"
            type="text"
          />
        <ButtonTertiary className={"x4spaceBefore x2spaceAfter"} onClick={props.onSubmit} >
          <FormattedMessage {...props.button} />
          </ButtonTertiary>
      </Form>
      <ModalOperation
        cancelCallback={props.cancelCallback}
        isOpen={props.transferInProgress}
        header={props.transferOutHeader}
        progressMessage={props.transferMessage}
        progressPercent={props.percentComplete}
        messageValues={props.transferValues}
      />
    </React.Fragment>
  );
}