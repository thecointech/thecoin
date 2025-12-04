import type { TheCoin } from "./codegen";
import { getSigner } from "@thecointech/signers";
import type { Signer } from "ethers";
import type { AccountName } from "@thecointech/signers";
import type { ContractSingletonManager } from "@thecointech/contract-base";
import type { Provider } from "ethers";

export function augmentContract(_core: ContractSingletonManager<TheCoin, [Provider?]>) {
  return {
    ..._core,
    connect: async (signer: AccountName|Signer, provider?: Provider) => {
      if (typeof signer === 'string') {
        signer = await getSigner(signer);
      }
      return _core.connect(signer, provider);
    }
  }
}
