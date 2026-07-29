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

it("does not collide across field boundaries in adjacent string fields", async () => {
  const requestA = await signHarvesterRegistrationRequest(wallet, {
    installationId: "ab",
    platform: "c",
    architecture: "",
    action: "notifyAll",
    observedAt: DateTime.fromISO("2026-07-27T10:00:00Z"),
  });
  const requestB = await signHarvesterRegistrationRequest(wallet, {
    installationId: "a",
    platform: "bc",
    architecture: "",
    action: "notifyAll",
    observedAt: DateTime.fromISO("2026-07-27T10:00:00Z"),
  });

  // A signature produced for one field split must not verify for the other,
  // even though naive packed concatenation would make them identical.
  expect(getHarvesterRegistrationSigner({ ...requestB, signature: requestA.signature })).not.toBe(wallet.address);
});
