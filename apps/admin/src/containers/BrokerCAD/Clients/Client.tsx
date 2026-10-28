import { useEffect, useState } from 'react';
import { AccountDetails } from '@thecointech/account';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { Header, Input, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserData } from './data';
import styles from './Client.module.less';
import { toCAD } from './toCAD';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { verifyMessage } from 'ethers';
import { AddressMatches } from '@thecointech/utilities/Address';

export type Props = UserData;
export const Client = (props: Props) => {

  const [allDetails, _setAllDetails] = useState<AccountDetails[]>([]);
  const [loading, _setLoading] = useState(false);
  const [percent, _setPercent] = useState(0);
  const [detailIdx, setDetailIdx] = useState(0);
  const rates = useFxRates();
  // const account = AccountMap.useActive();

  useEffect(() => {

    // setAllDetails([]);
    // setPercent(0);
    // let isCancelled = false;
    // const cancel = () => { isCancelled = true; }
    // setLoading(true);
    // loadDetails(props.address, idx, setAllDetails, setPercent, () => isCancelled)
    //   .then(() => setLoading(false));

    // return cancel;
  }, [props.address]);

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
      : "RE-IMPLEMENT DETAIL STORAGE";

  return (
    <div className={styles.clientContainer}>
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
      <List className={styles.transactionList}>
        {transactions.map(ClientTransaction)}
      </List>
    </div>
  )
}

// type SetDetailsState = (setter: (acc: AccountDetails[]) => AccountDetails[]) => void;
// async function loadDetails(_address: string, _setAllDetails: SetDetailsState, _setPercent: (n: number)=> void, _isCancelled: () => boolean) {
//   log.warn("Not Implemente")
// }

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

