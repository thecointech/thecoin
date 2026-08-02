import type { Content } from "@prismicio/client";
import { Simplify } from "../../../prismicio-types";

export type ScoreData = Content.CcqiScoreSlice["primary"];

export type SimpleData = Simplify<Content.CcqiScoreSliceDefaultPrimary>

interface SubSubSection {
  key: keyof ScoreData;
  label: string;
}

interface SubSection {
  key: keyof ScoreData;
  label: string;
  children: SubSubSection[];
}

export interface Section {
  key: keyof ScoreData;
  label: string;
  children: SubSection[];
}
