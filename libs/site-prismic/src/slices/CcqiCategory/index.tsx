"use client";
import React, { type FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { Header } from "semantic-ui-react";
import { ScorePill } from "../CcqiScore/ScorePill";
import type { ScoreData } from "../CcqiScore/types";
import styles from './index.module.css'
/**
 * Props for `CcqiCategory`.
 */
export type CcqiCategoryProps = SliceComponentProps<Content.CcqiCategorySlice>;

/**
 * Component for "CcqiCategory" Slices.
 */
const CcqiCategory: FC<CcqiCategoryProps> = ({ slice, slices }) => {
  const scoreData = getCcqiScoreSliceData(slices);
  const category = slice.primary.category;
  if (category === null) return null;
  const scoreKey = categoryMapping[category];
  const scoreValue = scoreKey ? (scoreData?.[scoreKey] as number | null | undefined) : null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={styles.categoryContainer}
    >
      <Header size="small">{slice.primary.category}:</Header>
      <span className={styles.categoryPillContainer}>
        {scoreKey && scoreValue != null ? <ScorePill value={scoreValue} /> : <span>N/A</span>}
      </span>
    </section>
  );
};

const getCcqiScoreSliceData = (slices: CcqiCategoryProps["slices"]): ScoreData | null => {
  const type: Content.CcqiScoreSlice["slice_type"] = "ccqi_score";
  const slice = slices.find((s) => s.slice_type === type) as Content.CcqiScoreSlice | undefined;
  return slice?.primary ?? null;
};

const categoryMapping: Record<string, keyof ScoreData> = {
  "Measurability": "s01c", // Robust quantification of emission reductions and removals
  "Additionality": "s01a", // Additionality
  "Permanence & Leakage": "s03", // Addressing non-permanence
  "Verifiability": "s05", // Strong institutional arrangements and processes
  "Social Benefits": "s06", // Environmental and social impacts
};

export default CcqiCategory;
