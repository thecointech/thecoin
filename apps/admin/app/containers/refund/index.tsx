import React, { useCallback, useState } from "react";
import { log } from "@the-coin/logging";
import { CertifiedTransferRecord } from "@the-coin/tx-firestore";
import { CertifiedTransferRequest } from "@the-coin/types";
import { ProcessRecord } from "@the-coin/utilities/firestore";
import { GetActionDoc } from "@the-coin/utilities/User";
import { Contract } from "ethers/contract";
import { DateTime } from "luxon";
import { Button } from "semantic-ui-react";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap";

type Props = {
  record: CertifiedTransferRecord,
  onComplete?: (refundHash: string) => void;
}
export const RefundButton = (props: Props) => {

  const [inProcess, setInProcess] = useState(false);
  const account = useActiveAccount();
  const doRefund = useCallback(() => {
    setInProcess(true);
    refund(props.record, account!.contract!)
      .then(() => setInProcess(false))
      .catch(() => setInProcess(false))
  }, [setInProcess, account])

  const disabled = inProcess && !!account?.contract;
  return <Button
    compact
    disabled={disabled}
    loading={inProcess}
    onClick={doRefund}
    content="Refund"
    />
}

export async function refund(record: CertifiedTransferRecord, contract: Contract) {
  const user = record.transfer.from;
  log.debug({ hash: record.hash }, `Refunding sale {hash}`);
  try {
    // First send the stuff back
    const hashRefund = await issueRefund(record.transfer, contract)
    // record this info in the database
    await updateDb(record.transfer.from, record.hash, {hashRefund});
    // Now we need to let the rest of the world know it's all done
    record.hashRefund = hashRefund;
  }
  catch(err) {
    log.fatal(err, { user, hash: record.hash },
      "Failed to issue refund for user {user} on transaction {hash}");
    throw err
    }
}

export async function issueRefund(transfer: CertifiedTransferRequest, contract: Contract) {
  // First, reverse the tx
  const { value, from, timestamp } = transfer;
  log.debug(`Issuing refund at transaction date: ${DateTime.fromMillis(transfer.timestamp).toSQLDate()} Transfering value: ${transfer.value}`);

  // Send the transfer back
  // TODO: Refunds should be at todays exchange rate(?)
  const tx = await contract.coinPurchase(
    from,
    value,
    0,
    Math.floor(timestamp / 1000)
  );

  log.trace(`Awaiting Transfer: ${tx.hash}`);
  await tx.wait();
  log.trace(`Transfer complete`);
  return tx.hash;
}

// Todo; move this (and all get/set functions) into tx-firestore
async function updateDb(user: string, hash: string, record: Partial<ProcessRecord>) {
  const actionDoc = GetActionDoc(user, "Sell", hash);
  const action = await actionDoc.get();
  if (!action.exists)
    throw new Error(`Cannot update User/${user}/Sell/${record.hash}, record does not exist`);

  await actionDoc.set(record, {merge: true});
  log.info({ user, action: 'Sell', hash, record }, "Updated user {user} {action} for {hash} with {record}");
}
