import { getCurrentState, TransitionCallback } from "@thecointech/tx-statemachine";
import { verifyPreTransfer } from "@thecointech/tx-statemachine/transitions";
import { BillPayeePacket, EncryptedPacket } from '@thecointech/types';
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { sign } from "@thecointech/utilities/SignedMessages";
import { log } from "@thecointech/logging";
import Decimal from 'decimal.js-light';
import { getSigner } from '@thecointech/signers';
import { DateTime } from 'luxon';
import { makeTransition } from '@thecointech/tx-statemachine';

//
// Process a bill payment
// This is virtually identical to etransfer, and perhaps could be de-duped.
// However, we also want the actions to be completely independent
export const payBill = makeTransition<"Bill">("payBill", async (container) =>
  await verifyPreTransfer(container) ?? await doPayBill(container)
);

const doPayBill: TransitionCallback<"Bill"> = async (container) => {
  // Can we pay a bill in our current state?
  const currentState = getCurrentState(container)
  const { fiat } = currentState.data;
  if (!fiat?.isPositive()) {
    return { error: "Cannot pay bill, no fiat available" };
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
    if (!isValid(decrypted))
      return { error: "bill payee packet is invalid" };
    // Keep track of decrypted instructions
    // (mostly for manual verification in the admin app)
    // NOTE: this doesn't work for replay tx's, so this
    // probably doesn't make any sense...
    container.instructions = decrypted!;
  }
  const { address } = container.action;
  const { payee, accountNumber } = container.instructions;
  const payeeNickname = await getPayeeNickname(container.instructions);
  log.info(
    {initialId: container.action.data.initialId, payeeNickname},
    "Paying Bill for {initialId} - {payeeNickname}"
  );
  const confirmation = await bank.payBill(address, payeeNickname, payee, accountNumber, fiat);
  return confirmation
    ? {
        meta: confirmation.toString(),
        fiat: new Decimal(0),
        date: DateTime.now(),
      }
    : { error: `Error Code: ${confirmation}`}
}

//
// Decrypt the actions' instruction packet
// NOTE: server does not have private key, and will not pass this step
const decryptInstructions = (packet: EncryptedPacket) => decryptTo<BillPayeePacket>(packet);

//
// Checks bill payment for minimum viability.
// We can't really be too smart here so just check there is -something-
const isValid = (packet: BillPayeePacket|null) =>
  packet &&
  packet.accountNumber?.length >= 2 &&
  packet.payee?.length >= 2;

// get a deterministic nickname for payee/acc no.
async function getPayeeNickname(packet: BillPayeePacket) {
  const signer = await getSigner("BrokerTransferAssistant");
  const r = await sign(`${packet.payee}:${packet.accountNumber}`, signer);
  return r.substr(0, 30);
}

