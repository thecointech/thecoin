"use client";

import { createContext, useContext } from "react";
import type { CcqiScoreData } from "./ccqiUtils";

const CcqiContext = createContext<CcqiScoreData>(null);

export function useCcqiScores(): CcqiScoreData {
  return useContext(CcqiContext);
}

export default CcqiContext;
