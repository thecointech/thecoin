import { log } from "@thecointech/logging";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { readFileSync } from "fs";
import { getCurrentState, TypedActionContainer } from "@thecointech/tx-statemachine";
import { EncryptedPacket, ETransferPacket } from "@thecointech/types";
import { Decimal } from "decimal.js-light";

// NOTE: server does not have private key, and will not pass this step
const privateKeyPath = process.env.DB_ACTION_PK_PATH;
const privateKey = privateKeyPath ? readFileSync(privateKeyPath).toString() : null;

//
// Attempt to send the balance as e-Transfer.
// If successfull will reset the fiat balance to 0
export async function sendETransfer(container: TypedActionContainer<"Sell">) {

  // Can we send an eTransfer in our current state?
  const currentState = getCurrentState(container)
  const {fiat} = currentState.data;
  if (!fiat?.isPositive())
    return { error: "Cannot send e-Transfer, no fiat available" };

  // If we are here without a bank API, it is an error
  // We should have stopped before doing preTransfer step
  const {bank} = container;
  if (!bank) return { error: 'Cannot deposit fiat, no bank API present'};

  // Get sending instructions
  const decrypted = decryptInstructions(container.action.data.initial.instructionPacket);
  if (!isValid(decrypted))
    return { error: "e-Transfer packet is invalid" };
  // Store decrypted instructions (mostly for manual verification in the admin app)
  container.instructions = decrypted;

  // Send the transfer
  const {address} = container.action;
  const toName = decrypted!.email.split('@')[0];
  const confirmation = await bank.sendETransfer(address, fiat.toNumber(), toName, decrypted!, progressCb);

  // If we have confirmation code, return success
  return (confirmation > 0)
    ? {
        meta: confirmation.toString(),
        fiat: new Decimal(0),
      }
    : { error: `Error Code: ${confirmation}`}
}

function progressCb(msg: string) {
  log.trace(msg);
}

//
// Decrypt the actions' instruction packet
function decryptInstructions(packet: EncryptedPacket) {
  if (!privateKey) {
    log.warn("Attempting to decrypt instructions, but no private key is present");
    return null;
  }
  return decryptTo<ETransferPacket>(privateKey, packet);
}

//
// Checks eTransfer for minimum viability
function isValid(packet: ETransferPacket|null) {
  // Invalid characters: < or >, { or }, [ or ], %, &, #, \ or "
  const invalidChars = /[\<\>\{\}\[\]\%\&\#\\\"]/g;
  return packet &&
    packet.question?.length > 0 &&
    packet.answer?.length > 0 &&
    !packet.answer.match(invalidChars) &&
    packet.email?.length > 3 &&
    packet.email?.includes("@") &&
    !packet.message?.match(invalidChars)
}

