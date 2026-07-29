import { Wallet } from "ethers";
import { DateTime } from "luxon";
import { getHarvesterRegistrationSigner, signHarvesterRegistrationRequest } from "./registration";

const wallet = Wallet.createRandom();

it("signs and verifies a registration request", async () => {
  const request = await signHarvesterRegistrationRequest(wallet, {
    installationId: "installation-1",
    platform: "linux",
    architecture: "x64",
    action: "notifyAll",
    observedAt: DateTime.fromISO("2026-07-27T10:00:00Z"),
  });

  expect(getHarvesterRegistrationSigner(request)).toBe(wallet.address);
  expect(getHarvesterRegistrationSigner({ ...request, action: "notifyNone" })).not.toBe(wallet.address);
});
