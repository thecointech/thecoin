import { DateTime } from "luxon";
import { init } from "@thecointech/firestore";
import { NormalizeAddress } from "@thecointech/utilities";
import {
  completeHarvesterRun,
  getAllHarvesterInstallations,
  getHarvesterInstallations,
  getHarvesterRegistrations,
  getHarvesterRun,
  getHarvesterRuns,
  getHarvesterStatus,
  recordHarvesterRegistration,
  startHarvesterRun,
} from "./harvester";

const address = "0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658";
const otherAddress = "0x1234567890123456789012345678901234567890";
const installationId = "installation-1";

beforeEach(async () => {
  await init();
});

it("stores registration history and current status", async () => {
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");
  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId,
    platform: "linux",
    architecture: "x64",
  });

  const status = await getHarvesterStatus(address, installationId);
  expect(status).toMatchObject({
    schemaVersion: 1,
    notifyAction: "notifyAll",
    installationId,
    platform: "linux",
    architecture: "x64",
  });
  expect(status?.registeredAt).toEqual(registeredAt);
  expect(status?.registrationUpdatedAt).toEqual(registeredAt);

  const registrations = await getHarvesterRegistrations(address, installationId);
  expect(registrations).toHaveLength(1);
  expect(registrations[0].observedAt).toEqual(registeredAt);
});

it("records a completed run and updates current status", async () => {
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");
  const startedAt = registeredAt.plus({ minutes: 5 });
  const finishedAt = startedAt.plus({ minutes: 2 });

  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId,
  });
  const startedRun = await startHarvesterRun(address, {
    installationId,
    trigger: "scheduled",
    startedAt,
  });
  await completeHarvesterRun(address, installationId, startedRun.runId, {
    outcome: "succeeded",
    finishedAt,
    terminalSource: "client",
  });

  const run = await getHarvesterRun(address, installationId, startedRun.runId);
  expect(run).toMatchObject({
    outcome: "succeeded",
    durationMs: 120000,
    terminalSource: "client",
  });
  expect(run?.startedAt).toEqual(startedAt);
  expect(run?.finishedAt).toEqual(finishedAt);

  const status = await getHarvesterStatus(address, installationId);
  expect(status?.lastRunId).toBe(startedRun.runId);
  expect(status?.lastOutcome).toBe("succeeded");
  expect(status?.lastStartedAt).toEqual(startedAt);
  expect(status?.lastFinishedAt).toEqual(finishedAt);
  expect(status?.lastHealthyAt).toEqual(finishedAt);

  const runs = await getHarvesterRuns(address, installationId);
  expect(runs).toHaveLength(1);
});

it("does not let a stale run completion clobber status from a newer run", async () => {
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");
  const staleStartedAt = registeredAt.plus({ minutes: 5 });
  const newStartedAt = staleStartedAt.plus({ minutes: 10 });
  const newFinishedAt = newStartedAt.plus({ minutes: 2 });
  const staleFinishedAt = newFinishedAt.plus({ minutes: 1 });

  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId,
  });

  // A run starts but never gets its completion delivered promptly...
  const staleRun = await startHarvesterRun(address, {
    installationId,
    trigger: "scheduled",
    startedAt: staleStartedAt,
  });

  // ...meanwhile a newer run starts and completes successfully, becoming lastRunId
  const newRun = await startHarvesterRun(address, {
    installationId,
    trigger: "scheduled",
    startedAt: newStartedAt,
  });
  await completeHarvesterRun(address, installationId, newRun.runId, {
    outcome: "succeeded",
    finishedAt: newFinishedAt,
    terminalSource: "client",
  });

  // The stale run's completion arrives late (e.g. delayed network request)
  await completeHarvesterRun(address, installationId, staleRun.runId, {
    outcome: "failed",
    finishedAt: staleFinishedAt,
    terminalSource: "client",
  });

  // The stale run itself is still recorded accurately...
  const staleRunDoc = await getHarvesterRun(address, installationId, staleRun.runId);
  expect(staleRunDoc?.outcome).toBe("failed");

  // ...but status must still reflect the newer, healthy run
  const status = await getHarvesterStatus(address, installationId);
  expect(status?.lastRunId).toBe(newRun.runId);
  expect(status?.lastOutcome).toBe("succeeded");
  expect(status?.lastFinishedAt).toEqual(newFinishedAt);
  expect(status?.lastHealthyAt).toEqual(newFinishedAt);
});

it("does not permit a completed run to change outcome", async () => {
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");
  const startedAt = registeredAt.plus({ minutes: 5 });
  const finishedAt = startedAt.plus({ minutes: 2 });

  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId,
  });
  const startedRun = await startHarvesterRun(address, {
    installationId,
    trigger: "manual",
    startedAt,
  });
  await completeHarvesterRun(address, installationId, startedRun.runId, {
    outcome: "failed",
    finishedAt,
    failureStages: ["PayVisa"],
    terminalSource: "client",
  });

  await expect(completeHarvesterRun(address, installationId, startedRun.runId, {
    outcome: "succeeded",
    finishedAt: finishedAt.plus({ minutes: 1 }),
    terminalSource: "client",
  })).rejects.toThrow("already complete");

  const run = await getHarvesterRun(address, installationId, startedRun.runId);
  expect(run?.outcome).toBe("failed");
  expect(run?.failureStages).toEqual(["PayVisa"]);
});

it("isolates status between multiple installations for the same user", async () => {
  const installationA = "installation-a";
  const installationB = "installation-b";
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");
  const startedAt = registeredAt.plus({ minutes: 5 });
  const finishedAt = startedAt.plus({ minutes: 2 });

  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId: installationA,
  });
  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId: installationB,
  });

  // B fails while A is untouched; A's status must not be affected by B's run.
  const startedRun = await startHarvesterRun(address, {
    installationId: installationB,
    trigger: "scheduled",
    startedAt,
  });
  await completeHarvesterRun(address, installationB, startedRun.runId, {
    outcome: "failed",
    finishedAt,
    terminalSource: "client",
  });

  const statusA = await getHarvesterStatus(address, installationA);
  expect(statusA?.notifyAction).toBe("notifyAll");
  expect(statusA?.lastRunId).toBeUndefined();
  expect(statusA?.lastOutcome).toBeUndefined();

  const statusB = await getHarvesterStatus(address, installationB);
  expect(statusB?.lastRunId).toBe(startedRun.runId);
  expect(statusB?.lastOutcome).toBe("failed");

  // Turning off notifications for B must not affect A's preference.
  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyNone",
    observedAt: finishedAt,
    installationId: installationB,
  });
  const statusAAfterBDisabled = await getHarvesterStatus(address, installationA);
  expect(statusAAfterBDisabled?.notifyAction).toBe("notifyAll");

  const installations = await getHarvesterInstallations(address);
  expect(installations.map(i => i.installationId).sort()).toEqual([installationA, installationB]);
});

it("enumerates installations across every user", async () => {
  const registeredAt = DateTime.fromISO("2026-07-27T10:00:00Z");

  await recordHarvesterRegistration(address, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId,
  });
  const otherInstall = "installation-other";
  await recordHarvesterRegistration(otherAddress, {
    schemaVersion: 1,
    action: "notifyNone",
    observedAt: registeredAt,
    installationId: otherInstall,
  });

  const all = await getAllHarvesterInstallations();
  expect(all).toHaveLength(2);
  expect(all).toEqual(expect.arrayContaining([
    expect.objectContaining({ address: NormalizeAddress(address), installationId, notifyAction: "notifyAll" }),
    expect.objectContaining({ address: NormalizeAddress(otherAddress), installationId: "installation-other", notifyAction: "notifyNone" }),
  ]));

  // Update otherInstall
  await recordHarvesterRegistration(otherAddress, {
    schemaVersion: 1,
    action: "notifyAll",
    observedAt: registeredAt,
    installationId: otherInstall,
  });

  const allAfterUpdate = await getAllHarvesterInstallations();
  expect(allAfterUpdate).toHaveLength(2);
  expect(allAfterUpdate).toEqual(expect.arrayContaining([
    expect.objectContaining({ address: NormalizeAddress(address), installationId, notifyAction: "notifyAll" }),
    expect.objectContaining({ address: NormalizeAddress(otherAddress), installationId: "installation-other", notifyAction: "notifyAll" }),
  ]));

    // Do one complete run
  const run1 = await startHarvesterRun(address, {
    installationId,
    trigger: "scheduled",
    startedAt: DateTime.now(),
  })
  await completeHarvesterRun(address, installationId, run1.runId, {
    outcome: "succeeded",
    finishedAt: DateTime.now(),
    terminalSource: "client",
  })

  // Do one failed run
  const run2 = await startHarvesterRun(otherAddress, {
    installationId: otherInstall,
    trigger: "scheduled",
    startedAt: DateTime.now(),
  })
  await completeHarvesterRun(otherAddress, otherInstall, run2.runId, {
    outcome: "failed",
    finishedAt: DateTime.now(),
    terminalSource: "client",
  })

  const allAfterRuns = await getAllHarvesterInstallations();
  expect(allAfterRuns).toHaveLength(2);
  expect(allAfterRuns).toEqual(expect.arrayContaining([
    expect.objectContaining({ address: NormalizeAddress(address), installationId, lastOutcome: "succeeded" }),
    expect.objectContaining({ address: NormalizeAddress(otherAddress), installationId: "installation-other", lastOutcome: "failed" }),
  ]));

});
