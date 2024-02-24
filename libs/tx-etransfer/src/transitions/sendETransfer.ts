import { log } from "@thecointech/logging";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { isPacketValid } from '@thecointech/utilities/VerifiedSale';
import { getCurrentState, TypedActionContainer } from "@thecointech/tx-statemachine";
import { EncryptedPacket, ETransferPacket } from "@thecointech/types";
import Decimal from 'decimal.js-light';;
import { DateTime } from 'luxon';
import { makeTransition } from '@thecointech/tx-statemachine';

//
// Attempt to send the balance as e-Transfer.
// If successfull will reset the fiat balance to 0
export const sendETransfer = makeTransition<"Sell">("sendETransfer", async (container) => {

  // Can we send an eTransfer in our current state?
  const currentState = getCurrentState(container)
  const {fiat} = currentState.data;
  if (!fiat?.isPositive()) {
    return { error: "Cannot send e-Transfer, no fiat available" };
  }

  // If we are here without a bank API, it is an error
  // We should have stopped before doing preTransfer step
  const {bank} = container;
  if (!bank) {
    return { error: 'Cannot deposit fiat, no bank API present'};
  }

  // instructions must be decoded within this action in case the transition
  // is interrupted; this action is atomic and the decoded actions cannot be serialized.
  if (!container.instructions) {
      // Get sending instructions
    const decrypted = await decryptInstructions(container.action.data.initial.instructionPacket);
    if (!isPacketValid(decrypted)) {
      return { error: "e-Transfer packet is invalid" };
    }
    // Keep track of decrypted instructions
    // (mostly for manual verification in the admin app)
    // NOTE: this doesn't work for replay tx's, so this
    // probably doesn't make any sense...
    container.instructions = decrypted!;
  }

  // Send the transfer
  const prefix = getPrefix(container);
  const toName = container.instructions.email.split('@')[0];
  log.info(
    { initialId: container.action.data.initialId },
    "Sending eTransfer for tx: {initialId}"
  );
  const confirmation = await bank.sendETransfer(prefix, fiat.toNumber(), toName, container.instructions, progressCb);

  // If we have confirmation code, return success
  return (confirmation > 0)
    ? {
        meta: confirmation.toString(),
        fiat: new Decimal(0),
        date: DateTime.now(),
      }
    : { error: `Error Code: ${confirmation}`}
});

function progressCb(msg: string) {
  log.trace(msg);
}

function getPrefix(container: TypedActionContainer<"Sell">) {
  const now = DateTime.now().toSQL({includeOffset: false, includeZone: false});
  const id = container.action.data.initialId.substring(0, 32);
  const {address} = container.action;
  return `${now} - ${address} - ${id}`;
}

//
// Decrypt the actions' instruction packet
// NOTE: server does not have private key, and will not pass this step
const decryptInstructions = (packet: EncryptedPacket) => decryptTo<ETransferPacket>(packet);
