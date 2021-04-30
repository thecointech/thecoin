import * as React from 'react';
import { Form, Header, Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { UxAddress } from '@thecointech/shared/components/UxAddress';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { AccountState } from '@thecointech/shared/containers/Account';
import { UxOnChange } from '@thecointech/shared/components/UxInput/types';

type VisualProps={

  errorMessage: MessageDescriptor,
  errorHidden: boolean,
  successMessage: MessageDescriptor,
  successHidden: boolean,

  description:MessageDescriptor,
  onValueChange: (value: number) => void,
  account: AccountState,
  coinTransfer: number | null,
  rate: number,

  onAccountValue: (e:UxOnChange) => void,
  forceValidate: boolean,
  onSubmit: StrictButtonProps["onClick"],
  button: MessageDescriptor,
  destinationAddress: string,

  onCancelTransfer: () => void,
  transferInProgress: boolean,
  transferOutHeader: MessageDescriptor | undefined,
  transferMessage: MessageDescriptor | undefined,
  percentComplete: number,
  transferValues: string,
};

export const TransferWidget = (props: VisualProps) => {
  
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
        
        <DualFxInput
          onChange={props.onValueChange}
          asCoin={true}
          maxValue={props.account.balance}
          value={props.coinTransfer}
          fxRate={props.rate}
        />
        <UxAddress
          uxChange={props.onAccountValue}
          forceValidate={props.forceValidate}
          placeholder={props.destinationAddress}
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
        messageValues={props.transferValues}
      />
    </React.Fragment>
  );
}

