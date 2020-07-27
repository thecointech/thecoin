import React, { useState, useCallback } from 'react';
import { Form, Header, Confirm } from 'semantic-ui-react';
import messages from './messages';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { useFxRates, weSellAt } from '@the-coin/shared/containers/FxRate';
import { toHuman } from '@the-coin/utilities';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap'
import { useAccountApi } from '@the-coin/shared/containers/Account';

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
  const account = useActiveAccount();
  if (!account)
    throw new Error("Account Required");

  const accountApi = useAccountApi(account.address);

  /////////////////////////////////////////////////////////
  const onMintCoins = useCallback(async () => {
    setStatus(MintStatus.PROCESSING);
    try {
      const { contract } = account;
      const tx = await contract!.mintCoins(toMint);
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
        progressMessage={messages.mintingInProgress}
        messageValues={{ txHash }}
      />
    </React.Fragment>
  );
}
