import { useEffect, useState } from 'react';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { Header, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserData } from './data';
import styles from './Client.module.less';
import { toCAD } from './toCAD';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { verifyMessage, Wallet } from 'ethers';
import { AddressMatches } from '@thecointech/utilities/Address';
import { getSigner } from '@thecointech/signers';
import { type AllUserData, getCurrentKycRecord, getUserBasicData } from '@thecointech/broker-db'
import { decryptKyc } from '@thecointech/account-details';
import { log } from '@thecointech/logging';
import type { BlockpassData } from '@thecointech/blockpass/types';


type ClientDetails = {
  basic?: AllUserData;
  kyc: BlockpassData;
}

export type Props = UserData;
export const Client = (props: Props) => {

  const [userData, setUserData] = useState<ClientDetails>();
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const rates = useFxRates();

  useEffect(() => {
    setUserData(undefined);
    setPercent(0);
    let isCancelled = false;
    setLoading(true);
    loadDetails(props.address)
      .then(details => {
        if (isCancelled) return;
        setUserData(details);
        setPercent(1);
        setLoading(false);
      })
      .catch(err => {
        log.error(err, "Failed to load client details");
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [props.address]);

  const transactions = [
    ...props.Buy,
    ...props.Sell,
    ...props.Bill,
    ...props.Plugin
  ].sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());

  const { basic, kyc } = userData || {};
  const name = (!kyc && loading)
    ? `Loading... ${(percent * 100).toFixed(1)}%`
    : kyc?.identities
      ? `${kyc.identities.given_name} ${kyc.identities.family_name}`
      : "RE-IMPLEMENT DETAIL STORAGE";

  return (
    <div className={styles.clientContainer}>
      <Header as='h4'>
        {props.address} - {toCAD(props.balanceCoin, rates.rates)}
      </Header>
      <hr />
      <div>{name}</div>
      <div>DOB: {kyc?.identities?.dob?.value ?? 'N/A'}</div>
      <div>email: {kyc?.identities?.email?.value ?? 'N/A'}</div>
      <div>status: {kyc?.status ?? 'N/A'}</div>
      <div>verified: {getIsVerified(basic?.uniqueIdSig, kyc).toString()}</div>
      <hr />
      <List className={styles.transactionList}>
        {transactions.map(ClientTransaction)}
      </List>
    </div>
  )
}

// Fetch all immutable KYC records for this client and decrypt each
// one with the BrokerCAD key (the only key they are wrapped to).
async function loadDetails(address: string) : Promise<ClientDetails|undefined> {
  const currentKyc = await getCurrentKycRecord(address);
  if (!currentKyc) {
    return undefined;
  }
  const signer = await getSigner("BrokerCAD");
  const privateKey = (signer as Wallet).privateKey;
  if (!privateKey) {
    log.warn("BrokerCAD signer has no private key: cannot decrypt KYC records");
    return undefined;
  }

  const decrypted = await decryptKyc(currentKyc, privateKey);
  if (!decrypted) {
    log.warn("Failed to decrypt KYC record");
    return undefined;
  }

  const basic = await getUserBasicData(address);

  return {
    basic,
    kyc: decrypted,
  }
}

function getIsVerified(uniqueIdSig?: string, details?: BlockpassData) {
  if (!details?.identities || !uniqueIdSig)
    return false;

  const {given_name, family_name, dob } = details.identities;
  if (!given_name || !family_name || !dob)
    return false;

  const uniqueId = buildUniqueId({given_name: given_name.value, family_name: family_name.value, dob: dob.value});
  const signedBy = verifyMessage(uniqueId, uniqueIdSig);
  return AddressMatches(signedBy, process.env.WALLET_BrokerTransferAssistant_ADDRESS!);
}

