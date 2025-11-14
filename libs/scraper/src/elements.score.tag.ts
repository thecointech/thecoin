import type { ElementData, SearchElementData } from "@thecointech/scraper-types";

const EquivalentTags = [
  // Interactive elements that act as buttons
  ['BUTTON', 'A', 'INPUT'],
  // Input text elements
  ['INPUT', 'TEXTAREA'],
  // Input select elements
  ['INPUT', 'SELECT'],
]

const tagsAreEquivalent = (a?: string, b?: string) => (
  a && b
  && EquivalentTags.find(t => t.includes(a) && t.includes(b))
);

// Tags aren't great filters, even for things like buttons
export function getTagScore(potential: ElementData, original: SearchElementData, selectorIndex?: Map<string, ElementData>) {
  if (potential.tagName == original.tagName) {
    return 1;
  } else {
    // Some tags can be used interchangeably. When estimated,
    // we want to catch child elements as well for cases where
    // a button contains a <span> etc for styling
    if (tagsAreEquivalent(original.tagName, potential.tagName)) {
      return 0.75;
    }
    else if (original.estimated && selectorIndex) {
      // When estimated, traverse up the hierarchy to find equivalent ancestor tags
      const found = findEquivalentAncestorTag(original, potential, selectorIndex);
      if (found) {
        return 0.75;
      }
    }
  }
  return 0;
}


const findEquivalentAncestorTag = (original: SearchElementData, potential: ElementData, selectorIndex: Map<string, ElementData>): ElementData | null => {

  if (tagsAreEquivalent(original.tagName, potential.tagName)) {
    return potential;
  }

  // If this is a label, and we are looking for a checkbox, fork down the targets tree
  // We could possibly expand this to include radio buttons/select dropdowns,
  // but it's unclear if it's a wise decision - those elements tend to be
  // findable on their own data, and we can't set input into a label.
  if (potential.tagName == "LABEL" && potential.for && original.inputType == "checkbox") {
    const target = selectorIndex.get(potential.for);
    if (target) {
      return findEquivalentAncestorTag(original, target, selectorIndex);
    }
  }

  if (!potential.parentSelector) return null;
  const next = selectorIndex.get(potential.parentSelector);
  if (!next) return null;

  return findEquivalentAncestorTag(original, next, selectorIndex);
}
