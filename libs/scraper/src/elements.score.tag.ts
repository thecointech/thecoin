import type { ElementData, SearchElementData } from "./types";



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
export function getTagScore(potential: ElementData, original: SearchElementData) {
  if (potential.tagName == original.tagName) {
    return 1;
  } else {
    // Some tags can be used interchangeably. When estimated,
    // we want to catch child elements as well for cases where
    // a button contains a <span> etc for styling
    if (tagsAreEquivalent(original.tagName, potential.tagName)
      || (
        original.estimated
        && tagsAreEquivalent(original.tagName, potential.parentTagName)
      )
    ) {
      return 0.75;
    }
  }
  return 0;
}
