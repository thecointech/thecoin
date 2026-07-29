import { Wallet } from "ethers";
import { DateTime } from "luxon";
import {
  signHarvesterRunStart,
  getHarvesterRunStartSigner,
  signHarvesterRunComplete,
  getHarvesterRunCompletionSigner,
} from "./runStartComplete";

const wallet = Wallet.createRandom();


it("signs and verifies a run start request", async () => {
  const request = await signHarvesterRunStart(wallet, {
    installationId: "installation-1",
    trigger: "scheduled",
    startedAt: DateTime.fromISO("2026-07-27T10:05:00Z"),
  });

  expect(getHarvesterRunStartSigner(request)).toBe(wallet.address);
  expect(getHarvesterRunStartSigner({ ...request, trigger: "manual" })).not.toBe(wallet.address);
});

it("signs and verifies a run completion request", async () => {
  const request = await signHarvesterRunComplete(wallet, {
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
