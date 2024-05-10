import { Wallet } from "ethers";
import { buildAssignPluginRequest } from "./assign";
import { DateTime } from "luxon";

it ("generates a valid assign plugin request", async () => {
  const wallet = Wallet.createRandom();
  const request = await buildAssignPluginRequest(
    wallet,
    wallet,
    0n,
    DateTime.now(),
  )
  expect(typeof request.plugin).toBe("string");
})
