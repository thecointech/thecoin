import type { Content } from "@prismicio/client";

export type CcqiScoreData = Content.CcqiScoreSlice["primary"] | null;

export function extractCcqiScores(
  slices: readonly { slice_type: string; primary?: unknown }[]
): CcqiScoreData {
  const ccqiSlice = slices.find((s) => s.slice_type === "ccqi_score");
  return (ccqiSlice?.primary as CcqiScoreData) ?? null;
}
