import { Wallet } from "ethers";
import { buildAssignPluginRequest } from "./assign";
import { LocalTimeSource } from "@thecointech/utilities/TimeSource";

it ("generates a valid assign plugin request", async () => {
  const wallet = Wallet.createRandom();
  const request = await buildAssignPluginRequest(
    wallet,
    wallet,
    0n,
    LocalTimeSource,
  )
  expect(typeof request.plugin).toBe("string");
})
