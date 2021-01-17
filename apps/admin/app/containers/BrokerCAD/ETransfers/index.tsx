import React, { useCallback } from "react";
import { EncryptedList } from "containers/EncryptedList";
import { ETransferPacket, CertifiedTransferRequest } from "@the-coin/types";
import { Segment, Button } from "semantic-ui-react";
import { TransactionData } from "../../TransferList";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap";
import { Contract } from "ethers";
import { log } from "@the-coin/logging";

const RenderETransfer = (props: TransactionData) => {
  const eTransfer = props.instruction as ETransferPacket;

  const account = useActiveAccount();
  const onDoRefund = useCallback(() => {
    const {record} = props;

    console.log(`Refunding sale ${record.hash}`);
    if (!account?.contract)
      throw new Error("We should always have a contract now.");

    RefundTransfer(record.transfer as CertifiedTransferRequest, account.contract)
      .then((hash) => {
        console.log("Amount Refunded");
        props.record.hashRefund = hash;
      })
      .catch((err: Error) => {
        log.fatal(err, {hash: record.hash},
          "Failed to issue refund on transaction {hash}");
        throw err
      });

  }, [props, account])
  return (
    <Segment>
      <div>Email: {eTransfer.email}</div>
      <div>Question: {eTransfer.question}</div>
      <div>Answer: {eTransfer.answer}</div>
      <div>Message: {eTransfer.message}</div>
      <div>Hash: {props.record.hash}</div>
      <Button onClick={onDoRefund}>Refund</Button>
    </Segment>
  )
}

export const ETransfers = () =>
  <EncryptedList render={RenderETransfer} type="Sell" />

async function RefundTransfer(transfer: CertifiedTransferRequest, contract: Contract)
{
  // First, reverse the tx
  // const signer = GetSigner(props.record.transfer as any);
  const {value, from} = transfer;
  console.log(`Transfering value:  sale ${transfer.from}`);

  // Send the transfer back
  // TODO: Refunds should be at todays exchange rate(?)
  const tx = await contract.coinPurchase(
    from,
    value,
    0,
    Math.floor(transfer.timestamp / 1000)
  );

  console.log('Reversing Transfer: ' + tx.hash);
  await tx.wait();
  return tx.hash;
}
