// Webpack-compatible export (no Next.js dynamic imports)

import Hero from "./Hero";
import RichText from "./RichText";
import TwoColumnLayout from "./TwoColumnLayout";
import BlockQuote from "./BlockQuote";

export const components = {
  hero: Hero,
  rich_text: RichText,
  two_column_layout: TwoColumnLayout,
  block_quote: BlockQuote,
};
