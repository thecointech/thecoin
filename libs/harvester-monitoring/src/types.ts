import type { DateTime } from "luxon";

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

export type HarvesterRegistrationRequest = Signed & {
  installationId: string;
  platform?: string;
  architecture?: string;
  action: HarvesterRegistrationAction;
  observedAt: DateTime;
}

export type HarvesterRunStartRequest = Signed & {
  installationId: string;
  platform?: string;
  architecture?: string;
  appVersion?: string;
  trigger: HarvesterRunTrigger;
  startedAt: DateTime;
  startedAtClient?: DateTime;
}

export type HarvesterRunCompletionRequest = Signed & {
  installationId: string;
  runId: string;
  outcome: HarvesterTerminalOutcome;
  finishedAt: DateTime;
  finishedAtClient?: DateTime;
  failureStages?: string[];
  failureCategory?: string;
  terminalSource: HarvesterTerminalSource;
}
