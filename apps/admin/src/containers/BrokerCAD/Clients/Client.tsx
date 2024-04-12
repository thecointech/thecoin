import { useEffect, useState } from 'react';
import { AccountDetails } from '@thecointech/account';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { getHistory, ComposeClient } from '@thecointech/idx';
import { Header, Input, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserData } from './data';
import { toCAD } from './toCAD';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { verifyMessage } from '@ethersproject/wallet';
import { AddressMatches } from '@thecointech/utilities/Address';

export type Props = UserData;
export const Client = (props: Props) => {

  const [allDetails, setAllDetails] = useState<AccountDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [detailIdx, setDetailIdx] = useState(0);
  const rates = useFxRates();
  const account = AccountMap.useActive();

  useEffect(() => {
    const idx = account?.idx;
    if (!idx)
      return;

    setAllDetails([]);
    setPercent(0);
    let isCancelled = false;
    const cancel = () => { isCancelled = true; }
    setLoading(true);
    loadDetails(props.address, idx, setAllDetails, setPercent, () => isCancelled)
      .then(() => setLoading(false));

    return cancel;
  }, [props.address, account?.idx]);

  const transactions = [
    ...props.Buy,
    ...props.Sell,
    ...props.Bill,
    ...props.Plugin
  ].sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());


  const details = allDetails[detailIdx];
  const name = (!details && loading)
    ? `Loading... ${(percent * 100).toFixed(1)}%`
    : details?.user
      ? `${details.user.given_name} ${details.user.family_name}`
      : "UNVERIFIED";

  return (
    <>
      <Header as='h4'>
        {props.address} - {toCAD(props.balanceCoin, rates.rates)}
      </Header>
      <hr />
      <Input
        type='number'
        width={50}
        value={detailIdx}
        min={0}
        max={allDetails.length}
        onChange={(_event, data) => setDetailIdx(Number(data.value))}
      /> {` of ${allDetails.length}`}
      <div>{name}</div>
      <div>DOB: {details?.user?.DOB}</div>
      <div>email: {details?.user?.email}</div>
      <div>status: {details?.status}</div>
      <div>verified: {getIsVerified(details).toString()}</div>
      <hr />
      <List>
        {transactions.map(ClientTransaction)}
      </List>
    </>
  )
}

type SetDetailsState = (setter: (acc: AccountDetails[]) => AccountDetails[]) => void;
async function loadDetails(address: string, client: ComposeClient, setAllDetails: SetDetailsState, setPercent: (n: number)=> void, isCancelled: () => boolean) {
  const history = await getHistory(address, client, 5, setPercent);
  if (!history) return;

  for (const raw of history) {
    try {
      const decrypted = await client.did?.decryptDagJWE(raw);
      if (isCancelled()) { return; }
      setAllDetails(acc => [...acc, decrypted?.data]);
    }
    catch (e) { }
  }
}

function getIsVerified(details?: AccountDetails) {
  if (!details?.user)
    return false;

  const {given_name, family_name, DOB } = details.user;
  if (!given_name || !family_name || !DOB || !details.uniqueIdSig)
    return false;

  const uniqueId = buildUniqueId({given_name, family_name, DOB});
  const signedBy = verifyMessage(uniqueId, details.uniqueIdSig);
  return AddressMatches(signedBy, process.env.WALLET_BrokerTransferAssistant_ADDRESS!);
}

