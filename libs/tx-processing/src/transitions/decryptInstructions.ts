import { SellAction } from "@thecointech/broker-db";
import { InstructionPacket } from "@thecointech/utilities/build/VerifiedAction";
import { decryptTo } from "@thecointech/utilities/Encrypt";

//
// Decrypt the actions' instruction packet
export function decryptInstructions(actions: SellAction[], privateKey: string) {
  return actions.map((action) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, action.data.initial.instructionPacket);
    return instructions;
  });
}
