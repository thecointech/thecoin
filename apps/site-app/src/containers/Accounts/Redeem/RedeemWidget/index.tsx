import * as React from 'react';
import { Form, Grid, Header, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import interact from './images/icon_payment_big.svg';
import { AccountState } from '@thecointech/shared/containers/Account';

type VisualProps={
    coinToSell: number | null,
    description:MessageDescriptor,
    onValueChange: (value: number) => void,
    account: AccountState | null,
    rate: number,

    emailLabel: MessageDescriptor,
    setEmail: (event: any) => void,
    emailDes: string,

    questionLabel: MessageDescriptor,
    setQuestion: (event: any) => void,
    noSpecialCaractDesc: string,

    answerLabel: MessageDescriptor,
    setAnswer: (event: any) => void,

    messageLabel: MessageDescriptor,
    setMessage: (event: any) => void,
    messageDesc: string,

    button: MessageDescriptor,
    onSubmit: StrictButtonProps["onClick"],

    cancelCallback: () => void,
    transferInProgress: boolean,
    transferOutHeader: MessageDescriptor | undefined,
    transferMessage: MessageDescriptor | undefined,
    percentComplete: number,
    transferValues: string,
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

        <DualFxInput
          onChange={props.onValueChange}
          asCoin={true}
          maxValue={props.account!.balance}
          value={props.coinToSell}
          fxRate={props.rate}
        />
        <Form.Input
          className={"borderTop borderBottom"}
          label={<FormattedMessage {...props.emailLabel} />}
          name="email"
          onChange={event => props.setEmail(event.target.value)}
          placeholder={props.emailDes}
        />
        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...props.questionLabel} />}
          name="question"
          onChange={event => props.setQuestion(event.target.value)}
          placeholder={props.noSpecialCaractDesc}
        />
        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...props.answerLabel} />}
          name="answer"
          onChange={event => props.setAnswer(event.target.value)}
          placeholder={props.noSpecialCaractDesc}
        />
        <Form.Input
          className={"borderTop"}
          label={<FormattedMessage {...props.messageLabel} />}
          name="message"
          type="text"
          onChange={event => props.setMessage(event.target.value)}
          placeholder={props.messageDesc}
        />
        <ButtonTertiary className={"x4spaceBefore x2spaceAfter"} onClick={props.onSubmit}><FormattedMessage {...props.button} /></ButtonTertiary>
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