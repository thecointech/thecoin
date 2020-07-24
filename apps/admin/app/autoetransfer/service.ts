import { CertifiedTransferRecord, Timestamp } from "@the-coin/utilities/firestore";
import { withFiat } from "../autoaction/utils";
import { FetchUnsettledRecords, DecryptRecords, MarkCertComplete } from "../autoaction";
import { getActionPrivateKey } from "../autoaction/key";
import { OfflineFxRates } from "../autoaction/fxrates";
import { log } from "../logging";
import { RbcApi } from "../RbcApi";
import { ETransferPacket } from "@the-coin/types";

export async function processUnsettledETransfers() : Promise<CertifiedTransferRecord[]> {

  log.trace('Processing e-Transfer requests');
  const api = new RbcApi();
  const toComplete = await fetchActionsToComplete();
  if (toComplete.length == 0)
    return [];

  const instructions = await getInstructions(toComplete);

  const progressCb = (s: string) => log.debug(s);
  for (let i = 0; i != toComplete.length; i++)
  {
    const record = toComplete[i];
    const instruction = instructions[i] as ETransferPacket;

    // first, let's do the transfer
    const address = record.transfer.from;
    const toName = instruction.email.split('@')[0];

    log.debug({hash: record.hash}, `Sending e-Transfer to complete transaction: {hash}`)
    const confirmation = await api.sendETransfer(address, record.fiatDisbursed, toName, instruction, progressCb);
    record.confirmation = confirmation;
    if (record.confirmation >= 0)
    {
      await MarkCertComplete("Sell", record);
    }
  }
  return toComplete;
}


export async function fetchActionsToComplete()
{
  const fxRates = new OfflineFxRates();
  const toSettle = await FetchUnsettledRecords('Sell', fxRates);

  await fxRates.waitFetches();
  const ts = Timestamp.now();
  // Filter out all tx's that have not yet settled
  toSettle.filter(tx => tx.processedTimestamp && tx.processedTimestamp >= ts)
  const toComplete = withFiat(toSettle, fxRates.rates);
  log.debug({action: 'Sell'}, `Fetched ${toComplete.length} {action} actions that are ready to complete`);
  return toComplete;
}


export async function getInstructions(toComplete: CertifiedTransferRecord[])
{
  const privateKey = await getActionPrivateKey();
  if (!privateKey)
  {
    throw new Error("Cannot process actions: Private Key is null");
  }

  const instructions = DecryptRecords(toComplete, privateKey);
  if (!instructions)
  {
    throw new Error('Cannot process actions: Instructions did not decrypt');
  }
  return instructions;
}
