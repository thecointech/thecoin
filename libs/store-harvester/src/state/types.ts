import type { toDb } from "./transform";
export type { HarvestData, HarvestDelta } from "./types.harvest";

export type StoredData = ReturnType<typeof toDb>;
