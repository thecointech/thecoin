/**
 * Slice components index
 * 
 * Export all slice components for use in site-landing
 * and for Slice Machine integration.
 */

// Re-export slice components
export { default as RichText } from "./RichText";
export type { RichTextProps } from "./RichText";

// Export the slice zone components map for SliceZone
import RichText from "./RichText";

export const components = {
    rich_text: RichText,
};
