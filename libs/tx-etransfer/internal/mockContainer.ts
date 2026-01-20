import { ContractCore } from "@thecointech/contract-core";
import { RbcApi } from "@thecointech/rbcapi";
import { getSigner } from "@thecointech/signers";
import { StateSnapshot, TypedActionContainer } from "@thecointech/tx-statemachine";
import { DateTime } from "luxon";

export const getMockContainer = async (date: DateTime): Promise<TypedActionContainer<"Sell">> => {
  const signer = await getSigner("BrokerTransferAssistant");
  return {
    instructions: null,
    action: {
      address: '0x445758E37F47B44E05E74EE4799F3469DE62A2CB',
      type: "Sell" as 'Sell',
      data: {
        initial: {
          transfer: {
            from: '0x445758E37F47B44E05E74EE4799F3469DE62A2CB',
            to: '0x23544d1596b2d8f608d1fd441131e719e0c5a685',
            amount: 100,
            currency: 124,
            signedMillis: date.toMillis(),
            transferMillis: date.plus({ days: 1 }).toMillis(),
          } as any,
          instructionPacket: {} as any,
          signature: '0x123',
        },
        date,
        initialId: "0x123",
      },
      history: [],
      doc: {} as any,
    },
    history: [{
      name: "initial",
      data: {},
      delta: {
        type: "no prior state",
        created: date,
        date,
      }
    }] as StateSnapshot<any>[],
    contract: await ContractCore.connect(signer),
    bank: await RbcApi.create(),
  }
}
