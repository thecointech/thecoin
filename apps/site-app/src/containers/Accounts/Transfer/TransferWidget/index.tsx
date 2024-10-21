import * as React from 'react';
import { Form, Header, Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { UxAddress } from '@thecointech/shared/components/UX/Address';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import type { ChangeCB } from '@thecointech/shared/components/UX/types';
import type { AccountState } from '@thecointech/account';
import type { MessageWithValues } from '@thecointech/shared/types';

type VisualProps={

  errorMessage: MessageDescriptor,
  errorHidden: boolean,
  successMessage: MessageDescriptor,
  successHidden: boolean,
  infoMessage?: MessageDescriptor,

  description:MessageDescriptor,
  onValueChange: (value: number) => void,
  account: AccountState,
  coinTransfer: number | null,
  rate: number,

  onAccountValue: ChangeCB,
  resetToDefault: number;
  forceValidate: boolean,
  onSubmit: StrictButtonProps["onClick"],
  button: MessageDescriptor,
  destinationAddress: MessageDescriptor,

  onCancelTransfer: () => void,
  transferInProgress: boolean,
  transferOutHeader: MessageDescriptor | undefined,
  transferMessage: MessageWithValues | undefined,
  percentComplete: number,
};

export const TransferWidget = (props: VisualProps) => {
  const commonProps = {
    resetToDefault: props.resetToDefault,
    forceValidate: props.forceValidate,
  }
  return (
    <React.Fragment>
      <Form>
        <Header as="h5">
          <Header.Subheader>
            <FormattedMessage {...props.description} />
          </Header.Subheader>
        </Header>

        <Message hidden={props.successHidden} positive>
          <FormattedMessage {...props.successMessage} />
        </Message>
        <Message hidden={props.errorHidden} negative>
          <FormattedMessage {...props.errorMessage} />
        </Message>
        {
          props.infoMessage &&
          <Message>
            <FormattedMessage {...props.infoMessage} />
          </Message>
        }


        <DualFxInput
          onChange={props.onValueChange}
          asCoin={true}
          maxValue={props.account.balance}
          value={props.coinTransfer}
          fxRate={props.rate}
        />
        <UxAddress
          onValue={props.onAccountValue}
          placeholder={props.destinationAddress}
          {...commonProps}
        />
        <ButtonTertiary onClick={props.onSubmit}>
            <FormattedMessage {...props.button} />
        </ButtonTertiary>
      </Form>
      <ModalOperation
        cancelCallback={props.onCancelTransfer}
        isOpen={props.transferInProgress}
        header={props.transferOutHeader}
        progressMessage={props.transferMessage}
        progressPercent={props.percentComplete}
      />
    </React.Fragment>
  );
}

