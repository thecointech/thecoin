// Webpack-compatible export (no Next.js dynamic imports)

import Hero from "./Hero";
import RichText from "./RichText";
import TwoColumnLayout from "./TwoColumnLayout";
import BlockQuote from "./BlockQuote";
import CcqiScore from "./CcqiScore";
import CcqiCategory from "./CcqiCategory";

export const components = {
  hero: Hero,
  rich_text: RichText,
  two_column_layout: TwoColumnLayout,
  block_quote: BlockQuote,
  ccqi_score: CcqiScore,
  ccqi_category: CcqiCategory
};
