import { Wallet } from "ethers";
import { DateTime } from "luxon";
import {
  buildHarvesterRegistrationRequest,
  getHarvesterRegistrationSigner,
  buildHarvesterRunStartRequest,
  getHarvesterRunStartSigner,
  buildHarvesterRunCompletionRequest,
  getHarvesterRunCompletionSigner,
} from "./index";

const wallet = Wallet.createRandom();

it("signs and verifies a registration request", async () => {
  const request = await buildHarvesterRegistrationRequest(wallet, {
    installationId: "installation-1",
    platform: "linux",
    architecture: "x64",
    action: "notifyAll",
    observedAt: DateTime.fromISO("2026-07-27T10:00:00Z"),
  });

  expect(getHarvesterRegistrationSigner(request)).toBe(wallet.address);
  expect(getHarvesterRegistrationSigner({ ...request, action: "notifyNone" })).not.toBe(wallet.address);
});

it("signs and verifies a run start request", async () => {
  const request = await buildHarvesterRunStartRequest(wallet, {
    installationId: "installation-1",
    trigger: "scheduled",
    startedAt: DateTime.fromISO("2026-07-27T10:05:00Z"),
  });

  expect(getHarvesterRunStartSigner(request)).toBe(wallet.address);
  expect(getHarvesterRunStartSigner({ ...request, trigger: "manual" })).not.toBe(wallet.address);
});

it("signs and verifies a run completion request", async () => {
  const request = await buildHarvesterRunCompletionRequest(wallet, {
    installationId: "installation-1",
    runId: "run-1",
    outcome: "failed",
    finishedAt: DateTime.fromISO("2026-07-27T10:07:00Z"),
    failureStages: ["PayVisa"],
    terminalSource: "client",
  });

  expect(getHarvesterRunCompletionSigner(request)).toBe(wallet.address);
  expect(getHarvesterRunCompletionSigner({ ...request, outcome: "succeeded" })).not.toBe(wallet.address);
});
