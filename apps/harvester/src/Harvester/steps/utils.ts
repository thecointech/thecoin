import { ContractCore } from "@thecointech/contract-core";
import { UserData } from "../types";
import { fetchRate, weSellAt } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";

export async function getBalance(user: UserData) {
  const tcCore = await ContractCore.connect(user.wallet);
  const address = await user.wallet.getAddress();
  const balance = await tcCore.pl_balanceOf(address);
  // What does this balance turn into?
  const rate = await fetchRate();
  return rate
    ? toHuman(
        Number(balance) * weSellAt([rate], new Date(rate.validFrom)),
        true
      )
    : undefined;
}
