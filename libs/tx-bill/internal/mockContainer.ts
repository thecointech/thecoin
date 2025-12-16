import { ContractCore } from "@thecointech/contract-core";
import { RbcApi } from "@thecointech/rbcapi";
import { getSigner } from "@thecointech/signers";
import { StateSnapshot, TypedActionContainer } from "@thecointech/tx-statemachine";
import { DateTime } from "luxon";
import { States } from "../src/uberGraph";

export const getMockContainer = async (date: DateTime): Promise<TypedActionContainer<"Bill">> => {
  const signer = await getSigner("BrokerTransferAssistant");
  return {
    instructions: null,
    action: {
      address: '0x445758E37F47B44E05E74EE4799F3469DE62A2CB',
      type: "Bill" as 'Bill',
      data: {
        initial: {
          transfer: {
            from: '0x445758E37F47B44E05E74EE4799F3469DE62A2CB',
            to: await (await getSigner("BrokerCAD")).getAddress(),
            amount: 100_000_000,
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
    }] as StateSnapshot<States>[],
    contract: await ContractCore.connect(signer),
    bank: await RbcApi.create(),
  }
}
