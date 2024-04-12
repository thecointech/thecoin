import React, { useState, useCallback } from 'react';
import { Form, Header, Confirm } from 'semantic-ui-react';
import messages from './messages';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { toHuman } from '@thecointech/utilities';
import { AccountMap } from '@thecointech/shared/containers/AccountMap'
import { Account } from '@thecointech/shared/containers/Account';
import { weSellAt } from '@thecointech/fx-rates';
import { DateTime } from 'luxon';

enum MintStatus {
  WAITING,
  CONFIRM,
  PROCESSING,
  COMPLETE,
}

export const Mint = () => {

  const [toMint, setToMint] = useState(0);
  const [status, setStatus] = useState(MintStatus.WAITING);
  const [txHash, setTxHash] = useState(undefined as MaybeString);

  const {rates} = useFxRates();
  const account = AccountMap.useActive();
  if (!account)
    throw new Error("Account Required");

  const accountApi = Account(account.address).useApi();

  /////////////////////////////////////////////////////////
  const onMintCoins = useCallback(async () => {
    setStatus(MintStatus.PROCESSING);

    try {
      debugger; // NOTE: THIS SHOULD BE IN MS, NOT SECONDS
      const { contract } = account;
      const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
      const tx = await contract!.mintCoins(toMint, brokerAddress, DateTime.now().toSeconds());
      setTxHash(tx.hash);
      await tx.wait();
      accountApi.updateBalance();

    } catch (e) {
      alert(e);
    }

    setStatus(MintStatus.COMPLETE);
  }, [setTxHash, setStatus, account, accountApi])

  /////////////////////////////////////////////////////////
  const onConfirm = useCallback(() => { setStatus(MintStatus.CONFIRM); }, [setStatus]);
  const onCancel = useCallback(() => { setStatus(MintStatus.WAITING); }, [setStatus]);

  const doConfirm = status === MintStatus.CONFIRM;
  const fxRate = weSellAt(rates);
  return (
    <React.Fragment>
      <Header>Mint Coin</Header>
      <p>Current Balance: {toHuman(account.balance, true)} </p>
      <Form>
        <DualFxInput onChange={setToMint} asCoin={true} value={toMint} fxRate={fxRate} />
        <Form.Button onClick={onConfirm}>MINT</Form.Button>
      </Form>
      <Confirm open={doConfirm} onCancel={onCancel} onConfirm={onMintCoins} />
      <ModalOperation
        isOpen={status === MintStatus.PROCESSING}
        header={messages.mintingHeader}
        progressMessage={{
          ...messages.mintingInProgress,
          values: { txHash }
        }}
      />
    </React.Fragment>
  );
}
