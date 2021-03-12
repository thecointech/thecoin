import * as React from 'react';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { UxAddress } from '@the-coin/shared/components/UxAddress';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import { ChangeCB } from '@the-coin/shared/components/UxInput/types';
import { AccountState } from '@the-coin/shared/containers/Account';

type VisualProps={
  description:MessageDescriptor,
  onValueChange:any,
  account: AccountState,
  coinTransfer: number | null,
  rate: number,

  onAccountValue: ChangeCB,
  forceValidate: boolean,
  onSubmit: any,
  button: MessageDescriptor,
  destinationAddress: string,

  onCancelTransfer: any,
  transferInProgress: boolean,
  transferOutHeader: MessageDescriptor | undefined,
  transferMessage: MessageDescriptor | undefined,
  percentComplete: number,
  transferValues: string,
};

export const Visual = (props: VisualProps) => {
  
  return (
    <React.Fragment>
      <Form>
        <Header as="h5">
          <Header.Subheader>
            <FormattedMessage {...props.description} />
          </Header.Subheader>
        </Header>

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

