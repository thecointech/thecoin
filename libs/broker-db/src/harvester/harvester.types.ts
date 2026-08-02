import { DateTime } from "luxon";
import type {
  HarvesterRegistrationAction,
  HarvesterRunTrigger,
  HarvesterTerminalOutcome,
  HarvesterTerminalSource,
} from "@thecointech/harvester-monitoring/types";
import { buildConverter, convertDates } from "../converter";

export type { HarvesterRegistrationAction, HarvesterRunTrigger, HarvesterTerminalOutcome, HarvesterTerminalSource };

// "running" is a DB-only state: it never appears on the wire as a signed
// request outcome (HarvesterTerminalOutcome, from @thecointech/harvester-monitoring),
// since a run can only be signed off as complete once it has a terminal outcome.
export type HarvesterRunOutcome = "running" | HarvesterTerminalOutcome;

// installationId/platform/architecture are stable for the life of an install.
// appVersion is deliberately excluded here: it changes independently of a
// config save (e.g. auto-update), so it belongs only on HarvesterRun/
// HarvesterRunStart, where it is captured fresh on every run.
export type HarvesterInstallationInfo = {
  installationId: string;
  platform?: string;
  architecture?: string;
}

export type HarvesterClientInfo = HarvesterInstallationInfo & {
  appVersion?: string;
}

export type HarvesterStatus = HarvesterClientInfo & {
  schemaVersion: 1;
  // Whether the user wants to be notified about failures/missed runs for
  // this installation. Purely a notification preference - it does not gate
  // whether a run is permitted to happen.
  notifyAction: HarvesterRegistrationAction;
  registeredAt: DateTime;
  registrationUpdatedAt: DateTime;
  lastRunId?: string;
  lastStartedAt?: DateTime;
  lastFinishedAt?: DateTime;
  lastHealthyAt?: DateTime;
  lastFailureAt?: DateTime;
  lastOutcome?: HarvesterRunOutcome;
  lastFailureStages?: string[];
}

export type HarvesterRegistration = HarvesterInstallationInfo & {
  schemaVersion: 1;
  action: HarvesterRegistrationAction;
  observedAt: DateTime;
}

export type HarvesterRun = HarvesterClientInfo & {
  schemaVersion: 1;
  trigger: HarvesterRunTrigger;
  startedAt: DateTime;
  startedAtClient?: DateTime;
  finishedAt?: DateTime;
  finishedAtClient?: DateTime;
  outcome: HarvesterRunOutcome;
  failureStages?: string[];
  failureCategory?: string;
  durationMs?: number;
  terminalSource?: HarvesterTerminalSource;
}

export type HarvesterRunStart = HarvesterClientInfo & {
  trigger: HarvesterRunTrigger;
  startedAt: DateTime;
  startedAtClient?: DateTime;
}

export type HarvesterRunCompletion = {
  outcome: HarvesterTerminalOutcome;
  finishedAt: DateTime;
  finishedAtClient?: DateTime;
  failureStages?: string[];
  failureCategory?: string;
  terminalSource: HarvesterTerminalSource;
}

export const harvesterStatusConverter = buildConverter<HarvesterStatus>(
  convertDates<HarvesterStatus>(
    "registeredAt",
    "registrationUpdatedAt",
    "lastStartedAt",
    "lastFinishedAt",
    "lastHealthyAt",
    "lastFailureAt",
  ),
);

export const harvesterRegistrationConverter = buildConverter<HarvesterRegistration>(
  convertDates<HarvesterRegistration>("observedAt"),
);

export const harvesterRunConverter = buildConverter<HarvesterRun>(
  convertDates<HarvesterRun>(
    "startedAt",
    "startedAtClient",
    "finishedAt",
    "finishedAtClient",
  ),
);
