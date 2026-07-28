import { DateTime } from "luxon";
import { init } from "@thecointech/firestore";
import {
  completeHarvesterRun,
  getHarvesterInstallations,
  getHarvesterRegistrations,
  getHarvesterRun,
  getHarvesterRuns,
  getHarvesterStatus,
  recordHarvesterRegistration,
  startHarvesterRun,
} from "./harvester";

const address = "0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658";
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
    runId: startedRun.runId,
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
