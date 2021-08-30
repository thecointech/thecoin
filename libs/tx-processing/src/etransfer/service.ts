import { CertifiedTransferRecord, Timestamp } from "@the-coin/utilities/firestore";
import { withFiat } from "../base/utils";
import { FetchUnsettledRecords, DecryptRecords, MarkCertComplete } from "../base";
import { getActionPrivateKey } from "../base/key";
import { OfflineFxRates } from "../base/fxrates";
import { log } from "@the-coin/logging";
import { RbcApi } from "@the-coin/rbcapi";
import { ETransferPacket } from "@the-coin/types";
import { SendMail } from '@the-coin/email';

export async function processUnsettledETransfers(api: RbcApi): Promise<CertifiedTransferRecord[]> {

  log.trace('Processing e-Transfer requests');
  const toComplete = await fetchActionsToComplete();
  if (toComplete.length == 0)
    return [];

  const instructions = await getInstructions(toComplete);

  const progressCb = (s: string) => log.debug(s);
  for (let i = 0; i != toComplete.length; i++)
  {
    const record = toComplete[i];
    if (record.fiatDisbursed == 0)
      continue;

    const instruction = instructions[i] as ETransferPacket;

    // TEMP Hack, unstick tx's to allow them to complete
    //instruction.message = instruction.message?.replace('&', 'and');
    if (!isValid(instruction))
    {
      console.log(JSON.stringify(record.fiatDisbursed));
      console.log(JSON.stringify(instruction));
      log.error({hash: record.hash}, "e-Transfer packet for {hash} is invalid: requires manual resolution");
      SendMail('Failed e-Transfer', `e-Transfer packet for ${record.hash} send ${record.recievedTimestamp.toDate()}is invalid: requires manual resolution`);
      continue;
    }

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

function isValid(packet: ETransferPacket) {
  // Invalid characters: < or >, { or }, [ or ], %, &, #, \ or "
  const invalidChars = /[\<\>\{\}\[\]\%\&\#\\\"]/g;
  return packet &&
    packet.question?.length >= 2 &&
    !packet.question?.match(invalidChars) &&
    packet.answer?.length >= 3 &&
    !packet.answer.match(invalidChars) &&
    packet.email?.length >= 3 &&
    packet.email?.includes("@") &&
    !packet.message?.match(invalidChars)
}

export async function fetchActionsToComplete() : Promise<CertifiedTransferRecord[]>
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
