import type { DateTime } from "luxon";

// Harvester monitoring types
export type HarvesterRegistrationAction = "notifyAll" | "notifyNone";
export type HarvesterRunTrigger = "scheduled" | "manual" | "unknown";
export type HarvesterTerminalOutcome = "succeeded" | "skipped" | "failed" | "abandoned";
export type HarvesterTerminalSource = "client" | "watchdog";

// Common shape for every signed harvester monitoring request: the claimed
// signer address plus the signature over the rest of the payload.
type Signed = {
  user: string;
  signature: string;
}

export type HarvesterRegistrationRequest = {
  installationId: string;
  platform?: string;
  architecture?: string;
  action: HarvesterRegistrationAction;
  observedAt: DateTime;
}

export type HarvesterRegistrationRequestDTO = Omit<HarvesterRegistrationRequest, "observedAt"> & {
  observedAt: number;
};

export type HarvesterRegistrationRequestSigned = Signed & HarvesterRegistrationRequestDTO;

export type HarvesterRunStart = {
  installationId: string;
  platform?: string;
  architecture?: string;
  appVersion?: string;
  trigger: HarvesterRunTrigger;
  startedAt: DateTime;
  startedAtClient?: DateTime;
}

export type HarvesterRunStartDTO = Omit<HarvesterRunStart, "startedAt"|"startedAtClient"> & {
  startedAt: number;
  startedAtClient?: number;
};

export type HarvesterRunStartSigned = Signed & HarvesterRunStartDTO;

export type HarvesterRunComplete = {
  installationId: string;
  runId: string;
  outcome: HarvesterTerminalOutcome;
  finishedAt: DateTime;
  finishedAtClient?: DateTime;
  failureStages?: string[];
  failureCategory?: string;
  terminalSource: HarvesterTerminalSource;
}

export type HarvesterRunCompleteDTO = Omit<HarvesterRunComplete, "finishedAt"|"finishedAtClient"> & {
  finishedAt: number;
  finishedAtClient?: number;
};

export type HarvesterRunCompleteSigned = Signed & HarvesterRunCompleteDTO;
