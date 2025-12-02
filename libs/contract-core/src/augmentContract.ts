import type { TheCoin } from "./codegen";
import { getSigner } from "@thecointech/signers";
import type { Signer } from "ethers";
import type { AccountName } from "@thecointech/signers";
import type { ContractSingletonManager } from "@thecointech/contract-base";

export function augmentContract(_core: ContractSingletonManager<Promise<TheCoin>, []>) {
  return {
    ..._core,
    connect: async (signer: AccountName|Signer) => {
      if (typeof signer === 'string') {
        signer = await getSigner(signer);
      }
      return _core.connect(signer);
    }
  }
}
