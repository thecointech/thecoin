import { type CollectionReference, type DocumentData, type DocumentReference, getFirestore, type FirestoreAdmin } from "@thecointech/firestore";
import type { DocumentReference as AdminDocumentReference, FirestoreDataConverter as AdminFirestoreDataConverter } from "@google-cloud/firestore";
import { getUserDoc } from "../user";
import {
  HarvesterClientInfo,
  HarvesterInstallationInfo,
  HarvesterRegistration,
  HarvesterRun,
  HarvesterRunCompletion,
  HarvesterRunStart,
  HarvesterStatus,
  harvesterRegistrationConverter,
  harvesterRunConverter,
  harvesterStatusConverter,
} from "./harvester.types";

const RunsCollectionId = "Runs";
const RegistrationsCollectionId = "Registrations";

const getFirestoreAdmin = () => getFirestore() as FirestoreAdmin;

// @thecointech/firestore types DocumentReference as a client|admin union so
// the package stays environment-agnostic for browser consumers. broker-db is
// server-only, so the runtime shape is always admin; narrow explicitly here
// rather than widening the shared union (which would erase converter typing
// for every other consumer of that package).
const toAdminRef = <T extends DocumentData>(ref: DocumentReference<T>) =>
  ref as unknown as AdminDocumentReference<T>;

const assertDocumentId = (id: string, name: string) => {
  if (!id || id.includes("/")) {
    throw new Error(`Invalid ${name}`);
  }
}

const installationInfo = ({ installationId, platform, architecture }: HarvesterInstallationInfo) => ({
  installationId,
  ...(platform !== undefined ? { platform } : {}),
  ...(architecture !== undefined ? { architecture } : {}),
});

const clientInfo = ({ installationId, appVersion, platform, architecture }: HarvesterClientInfo) => ({
  installationId,
  ...(appVersion !== undefined ? { appVersion } : {}),
  ...(platform !== undefined ? { platform } : {}),
  ...(architecture !== undefined ? { architecture } : {}),
});

export function getHarvesterCollection(address: string): CollectionReference<HarvesterStatus> {
  return getUserDoc(address).collection("Harvester").withConverter(harvesterStatusConverter);
}

// Each installation gets its own status document, keyed by installationId,
// so multiple installations for the same user (e.g. old + new machine) do
// not clobber each other's enabled flag, last-run info, or health signals.
export function getHarvesterStatusDoc(address: string, installationId: string): DocumentReference<HarvesterStatus> {
  assertDocumentId(installationId, "installation ID");
  return getHarvesterCollection(address).doc(installationId);
}

export function getHarvesterRunsCollection(address: string, installationId: string): CollectionReference<HarvesterRun> {
  return getHarvesterStatusDoc(address, installationId).collection(RunsCollectionId).withConverter(harvesterRunConverter);
}

export function getHarvesterRunDoc(address: string, installationId: string, runId: string): DocumentReference<HarvesterRun> {
  assertDocumentId(runId, "run ID");
  return getHarvesterRunsCollection(address, installationId).doc(runId);
}

export function getHarvesterRegistrationsCollection(address: string, installationId: string): CollectionReference<HarvesterRegistration> {
  return getHarvesterStatusDoc(address, installationId).collection(RegistrationsCollectionId).withConverter(harvesterRegistrationConverter);
}

export function getHarvesterRegistrationDoc(address: string, installationId: string): DocumentReference<HarvesterRegistration> {
  return getHarvesterRegistrationsCollection(address, installationId).doc();
}

export async function getHarvesterStatus(address: string, installationId: string) {
  return (await getHarvesterStatusDoc(address, installationId).get()).data();
}

// Enumerates every installation this user has ever registered, so callers
// (e.g. a watchdog or UI) can reason about a user with multiple installations
// instead of assuming there is exactly one.
export async function getHarvesterInstallations(address: string) {
  const snapshot = await getHarvesterCollection(address).get();
  return [...snapshot.docs].map(doc => doc.data());
}

// Enumerates every installation across every user, for cross-account
// monitoring (e.g. a weekly watchdog report). Uses a collection-group query
// since installations are stored per-user; the owning address is recovered
// from each doc's parent user document.
export async function getAllHarvesterInstallations() {
  const db = getFirestoreAdmin();
  const snapshot = await db
    .collectionGroup("Harvester")
    .withConverter(harvesterStatusConverter as unknown as AdminFirestoreDataConverter<HarvesterStatus>)
    .get();

  return snapshot.docs.map(doc => ({
    address: doc.ref.parent.parent!.id,
    ...doc.data(),
  }));
}

export async function getHarvesterRun(address: string, installationId: string, runId: string) {
  return (await getHarvesterRunDoc(address, installationId, runId).get()).data();
}

export async function getHarvesterRuns(address: string, installationId: string) {
  const snapshot = await getHarvesterRunsCollection(address, installationId).get();
  return [...snapshot.docs]
    .map(doc => doc.data())
    .sort((left, right) => left.startedAt.toMillis() - right.startedAt.toMillis());
}

export async function getHarvesterRegistrations(address: string, installationId: string) {
  const snapshot = await getHarvesterRegistrationsCollection(address, installationId).get();
  return [...snapshot.docs]
    .map(doc => doc.data())
    .sort((left, right) => left.observedAt.toMillis() - right.observedAt.toMillis());
}

export async function recordHarvesterRegistration(address: string, registration: HarvesterRegistration) {
  const db = getFirestoreAdmin();
  const statusDoc = getHarvesterStatusDoc(address, registration.installationId);
  const registrationDoc = getHarvesterRegistrationDoc(address, registration.installationId);

  return db.runTransaction(async transaction => {
    const existingStatus = await transaction.get(toAdminRef(statusDoc));
    const existing = existingStatus.data();

    const status: HarvesterStatus = {
      schemaVersion: 1,
      notifyAction: registration.action,
      registeredAt: existing?.registeredAt ?? registration.observedAt,
      registrationUpdatedAt: registration.observedAt,
      ...installationInfo(registration),
      // Registration does not carry appVersion (it goes stale independently
      // of a config save); preserve whatever the last run reported instead
      // of erasing it, since this write is a full set(), not a merge.
      ...(existing?.appVersion !== undefined ? { appVersion: existing.appVersion } : {}),
      ...(existing?.lastRunId !== undefined ? { lastRunId: existing.lastRunId } : {}),
      ...(existing?.lastStartedAt !== undefined ? { lastStartedAt: existing.lastStartedAt } : {}),
      ...(existing?.lastFinishedAt !== undefined ? { lastFinishedAt: existing.lastFinishedAt } : {}),
      ...(existing?.lastHealthyAt !== undefined ? { lastHealthyAt: existing.lastHealthyAt } : {}),
      ...(existing?.lastFailureAt !== undefined ? { lastFailureAt: existing.lastFailureAt } : {}),
      ...(existing?.lastOutcome !== undefined ? { lastOutcome: existing.lastOutcome } : {}),
      ...(existing?.lastFailureStages !== undefined ? { lastFailureStages: existing.lastFailureStages } : {}),
    };

    transaction.set(toAdminRef(statusDoc), status);
    transaction.set(toAdminRef(registrationDoc), registration);
    return registration;
  });
}

export async function startHarvesterRun(address: string, start: HarvesterRunStart) {
  const db = getFirestoreAdmin();
  const statusDoc = getHarvesterStatusDoc(address, start.installationId);
  const runDoc = getHarvesterRunsCollection(address, start.installationId).doc();

  return db.runTransaction(async transaction => {
    const statusSnapshot = await transaction.get(toAdminRef(statusDoc));
    const status = statusSnapshot.data();
    if (!status) {
      throw new Error("Harvester must request monitoring before a run can start");
    }

    const run: HarvesterRun = {
      schemaVersion: 1,
      outcome: "running",
      ...start,
    };
    const statusUpdate: Partial<HarvesterStatus> = {
      ...clientInfo(start),
      lastRunId: runDoc.id,
      lastStartedAt: start.startedAt,
      lastOutcome: "running",
    };

    transaction.set(toAdminRef(runDoc), run);
    transaction.set(toAdminRef(statusDoc), statusUpdate, { merge: true });
    return {
      ...run,
      runId: runDoc.id,
    };
  });
}

export async function completeHarvesterRun(address: string, installationId: string, runId: string, completion: HarvesterRunCompletion) {
  assertDocumentId(runId, "run ID");
  if ((completion.outcome === "succeeded" || completion.outcome === "skipped") && completion.failureStages?.length) {
    throw new Error(`Harvester run ${runId} cannot be healthy and contain failures`);
  }

  const db = getFirestoreAdmin();
  const statusDoc = getHarvesterStatusDoc(address, installationId);
  const runDoc = getHarvesterRunDoc(address, installationId, runId);

  return db.runTransaction(async transaction => {
    const [runSnapshot, statusSnapshot] = await Promise.all([
      transaction.get(toAdminRef(runDoc)),
      transaction.get(toAdminRef(statusDoc)),
    ]);
    const run = runSnapshot.data();
    if (!run) {
      throw new Error(`Harvester run ${runId} does not exist`);
    }
    if (run.outcome !== "running") {
      if (run.outcome === completion.outcome) {
        return run;
      }
      throw new Error(`Harvester run ${runId} is already complete`);
    }
    if (completion.finishedAt < run.startedAt) {
      throw new Error(`Harvester run ${runId} cannot finish before it started`);
    }

    const completedRun: Partial<HarvesterRun> = {
      ...completion,
      durationMs: completion.finishedAt.toMillis() - run.startedAt.toMillis(),
    };

    // Because this is running through a transaction, we manually apply the converter.
    const cleaned = cleanUndefined(completedRun);
    const fsRun = harvesterRunConverter.toFirestore(cleaned as HarvesterRun);
    transaction.set(toAdminRef(runDoc), fsRun, { merge: true });

    // A newer run may have already started (and become `lastRunId`) while
    // this one was still outstanding. In that case, don't let this stale
    // completion clobber the status doc with older data.
    const status = statusSnapshot.data();
    if (status?.lastRunId === runId) {
      const healthy = completion.outcome === "succeeded" || completion.outcome === "skipped";
      const statusUpdate: Partial<HarvesterStatus> = {
        lastFinishedAt: completion.finishedAt,
        lastOutcome: completion.outcome,
        ...(healthy ? { lastHealthyAt: completion.finishedAt } : {
          lastFailureAt: completion.finishedAt,
          ...(completion.failureStages !== undefined ? { lastFailureStages: completion.failureStages } : {}),
        }),
      };
      const cleaned = cleanUndefined(statusUpdate);
      const fsStatus = harvesterStatusConverter.toFirestore(cleaned as HarvesterStatus);
      transaction.set(toAdminRef(statusDoc), fsStatus, { merge: true });
    }

    return {
      ...run,
      ...completedRun,
    };
  });
}


function cleanUndefined<T extends Record<string, any>>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}
