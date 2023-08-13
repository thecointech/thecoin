import { Button } from "semantic-ui-react";
import { AnyAction } from '@thecointech/broker-db';

type Props = {
  action: AnyAction,
  onComplete?: (refundHash: string) => void;
}
export const RefundButton = (_props: Props) => {

  // const [inProcess, setInProcess] = useState(false);
  // const account = useActiveAccount();
  // const doRefund = useCallback(() => {
  //   setInProcess(true);
  //   if (action.type == "Sell") {
  //     //refund(action, account!.contract!)
  //     .then(() => setInProcess(false))
  //     .catch(() => setInProcess(false))
  //   }
  // }, [setInProcess, account])

  const inProcess = false;
  const disabled = true; // inProcess && !!account?.contract;
  return <Button
    compact
    disabled={disabled}
    loading={inProcess}
    //onClick={doRefund}
    content="Refund"
    />
}

// export async function refund(action: SellAction, contract: Contract) {
//   const user = record.transfer.from;
//   log.debug({ hash: record.hash }, `Refunding sale {hash}`);
//   try {
//     // First send the stuff back
//     const hashRefund = await issueRefund(record.transfer, contract)
//     // record this info in the database
//     await updateDb(record.transfer.from, record.hash, {hashRefund});
//     // Now we need to let the rest of the world know it's all done
//     record.hashRefund = hashRefund;
//   }
//   catch(err) {
//     log.fatal(err, { user, hash: record.hash },
//       "Failed to issue refund for user {user} on transaction {hash}");
//     throw err
//     }
// }

// export async function issueRefund(transfer: CertifiedTransferRequest, contract: Contract) {
//   // First, reverse the tx
//   const { value, from, timestamp } = transfer;
//   log.debug(`Issuing refund at transaction date: ${DateTime.fromMillis(transfer.timestamp).toSQLDate()} Transfering value: ${transfer.value}`);

//   // Send the transfer back
//   // TODO: Refunds should be at todays exchange rate(?)
//   const tx = await contract.coinPurchase(
//     from,
//     value,
//     0,
//     Math.floor(timestamp / 1000)
//   );

//   log.trace(`Awaiting Transfer: ${tx.hash}`);
//   await tx.wait();
//   log.trace(`Transfer complete`);
//   return tx.hash;
// }

// // Todo; move this (and all get/set functions) into tx-firestore
// async function updateDb(user: string, hash: string, record: Partial<ProcessRecord>) {
//   const actionDoc = GetActionDoc(user, "Sell", hash);
//   await actionDoc.set(record, {merge: true});
//   log.info({ user, action: 'Sell', hash, record }, "Updated user {user} {action} for {hash} with {record}");
// }
