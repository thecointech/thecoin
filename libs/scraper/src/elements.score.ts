import { log } from "@thecointech/logging";
import { SimilarityPipeline } from "./similarity";
import { Coords, ElementData, SearchElementData, Font } from "./types";
import { getValueParsing, parseValue } from "./valueParsing";
import { distance as levenshtein } from 'fastest-levenshtein';

const EquivalentInputTypes = [
  // All of the following attributes tend to show up looking the same on the page
  ['text', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'search', 'tel', 'time', 'url', 'week'],
  ['checkbox', 'radio'],
  ['submit', 'reset', 'button'],
]

const EquivalentTags = [
  // Interactive elements that act as buttons
  ['button', 'a', 'input'],
  // Input text elements
  ['input', 'textarea'],
  // Input select elements
  ['input', 'select'],
]

// This scoring function reaaaaally needs to be replaced with
// a computed (learned) model, because manually scoring is just
// too easy to bias to right-nows problems
export async function scoreElement(potential: ElementData, original: SearchElementData) {
  const components: Record<string, number> = {
    selector:         30 * getSelectorScore(potential.selector, original.selector),
    tag:              20 * getTagScore(potential, original),
    // Input type can be very important, as it doubles for a decent tag filter
    inputType:        50 * getInputTypeScore(potential, original),
    // Mostly useless, fonts are all over the place
    font:             10 * getFontScore(potential.font, original.font),
    // Includes aria-label & <label>.  Is a good boost to <input> types
    label:            25 * await getLabelScore(potential.label, original.label),
    role:             20 * getRoleScore(potential, original),
    positionAndSize:  20 * getPositionAndSizeScore(potential, original), // Can be 2 if both match perfectly
    nodeValue:        40 * await getNodeValueScore(potential, original),
    siblings:         30 * await getSiblingScore(potential, original),
    estimatedText:    40 * getEstimatedTextScore(potential, original)
  };

  // max score is 195
  const score = Object.values(components).reduce((sum, score) => sum + score, 0);
  if (Number.isNaN(score)) {
    log.fatal(`NaN score on ${potential.selector} - ${potential.text}`, JSON.stringify(components));
    // This is terrible, but it's not necessary to crash.  Just ensure it's not picked.
    return { score: -1000, components };
  }
  return { score, components };
}

// Selectors are great when a perfect match is found, useless otherwise
function getSelectorScore(potential: string, original: string | undefined) {
  return potential == original ? 1 : 0;
}

// Tags aren't great filters, even for things like buttons
function getTagScore(potential: ElementData, original: Partial<ElementData>) {
  if (potential.tagName == original.tagName) {
    return 1;
  } else {
    // Some kinds of elemements can be interchangeable
    if (EquivalentTags.find(t => t.includes(original.tagName!) && t.includes(potential.tagName!))) {
      // We could also score input[button] higher etc, but that's getting a bit too complicated,
      // and shouldn't be necessary.  Instead we will transition to a learned model soon
      return 0.5;
    }
  }
  return 0;
}

function getInputTypeScore(potential: ElementData, original: SearchElementData): number {
  if (original.tagName !== 'INPUT' || potential.tagName !== 'INPUT') return 0;

  const originalType = original.inputType ?? 'text';
  const potentialType = potential.inputType ?? 'text';

  if (potentialType === originalType) return 1;
  if (EquivalentInputTypes.find(t => t.includes(potentialType) && t.includes(originalType))) {
    return 0.5;
  }
  return 0;
}

function getFontScore(potential: Font | undefined, original: Font | undefined) {
  return (
    (potential?.color == original?.color ? 0.25 : 0) +
    (potential?.font == original?.font ? 0.25 : 0) +
    (potential?.size == original?.size ? 0.25 : 0) +
    (potential?.style == original?.style ? 0.25 : 0)
  )
}

function getPositionAndSizeScore(potential: ElementData, original: SearchElementData): number {
  if (!potential.coords || !original.coords) return 0;

  const sizeScore = getSizeScore(potential.coords, original.coords);
  const positionScore = getPositionScore(potential.coords, original.coords);
  const totalScore = original.estimated
    // In an estimated run, we score higher on position, but position mis-matches introdue a negative penalty
    ? sizeScore + positionScore
    // In a regular run, we do not penalize position changes, but rely less on the position overall
    : (Math.max(sizeScore, 0) + Math.max(positionScore, 0)) / 2;
  return totalScore;
}

//
// Get a score based on similarity of the potential's siblings to the original
export async function getSiblingScore(potential: ElementData, original: SearchElementData) {
  const potentialSiblings = potential.siblingText;
  const originalSiblings = original.siblingText;
  // If both have siblings
  if (potentialSiblings?.length && originalSiblings?.length) {

    // For each sibling in original, get the most similar of potential
    const scores = await Promise.all(
      originalSiblings.map(
        async oText => await SimilarityPipeline.calculateSimilarity(oText, potentialSiblings!)
      )
    )

    // For each, what is the index of their max similarity?
    const indexOfMostSimilar = scores.map(s => s.indexOf(Math.max(...s)))

    // Sum up the scores of the most similar
    const grossSimilarity = indexOfMostSimilar.reduce((acc, val, i) => acc + scores[i][val], 0)
    // Penalize for missing siblings.  The result should always be less than 1, but will
    // be chosen if (for example) the siblings have been re-ordered or some such
    const weightedSimilarity = grossSimilarity / Math.max(originalSiblings.length, potentialSiblings.length);

    // To simple sentence comparison, and see how similar they are
    // This will handle cases where siblings are split up
    const [simpleSimilarity] = await SimilarityPipeline.calculateSimilarity(
      originalSiblings.join(' '),
      [potentialSiblings.join(' ')]
    )

    return Math.max(simpleSimilarity, weightedSimilarity)
  }

  // If neither have any siblings, mark as 10 pts cause that's pretty close
  else if (potentialSiblings?.length == originalSiblings?.length) {
    return 0.5;
  }
  else if (original.estimated && potentialSiblings?.length == 0) {
    // Estimates will pick up siblings that are not precisely in-line
    // So do not penalize if the potential ones are not there.
    return 0;
  }
  // Downvote if one has siblings and the other doesn't
  return -0.25;
}

async function getLabelScore(potential: string|null, original: string|null|undefined) {
  if (potential && original) {
    const [score] = await SimilarityPipeline.calculateSimilarity(original, [potential])
    return score;
  }
  return 0;
}

export function getRoleScore(potential: ElementData, original: SearchElementData) {
  const matchScore = (original.role == potential.role)
    ? 1
    : -1;
  // When estimating, we need both roles to get a score.
  if (original.estimated) {
    return (original.role && potential.role)
      ? matchScore
      : 0;
  }

  // In replay, if either has a role, they have to match
  return (original.role || potential.role)
    ? matchScore
    : 0;
}

// Center score the difference between the two centers, scaled by the max
// Basically, as long as the center is within the largest bounding box, it
// should give some points.  The score drops below zero if the center moves
// outside the radius of the oval defined by the two boxes
function getPositionScore(potential: Coords, original: Coords) {
  const originalCenterX = original.left + (original.width / 2);
  const potentialCenterX = potential.left + (potential.width / 2);
  const diffX = Math.abs(originalCenterX - potentialCenterX);
  const diffY = Math.abs(original.centerY - potential.centerY);

  const maxWidth = Math.max(original.width, potential.width);
  const maxHeight = Math.max(original.height, potential.height);
  const scoreCenterX = 1 - (diffX / (maxWidth / 2));
  const scoreCenterY = 1 - (diffY / (maxHeight / 2));
  return (scoreCenterX + scoreCenterY) / 2;
}

// Size score is the similarity between the two boxes
function getSizeScore(potential: Coords, original: Coords) {
  const maxWidth = Math.max(potential.width, original.width);
  const maxHeight = Math.max(potential.height, original.height);
  const scoreWidth = 1 - Math.abs(potential.width - original.width) / maxWidth;
  const scoreHeight = 1 - Math.abs(potential.height - original.height) / maxHeight;
  return (scoreWidth + scoreHeight) / 2;
}

async function getNodeValueScore(potential: ElementData, original: SearchElementData) {
  if (original.parsing?.type == "currency" || original.parsing?.type == "date") {
    // Amounts that have parsing are expected to change, so we score them
    // on their parsing matching, rather than their actual value
    return getValueParsingScore(potential, original);
  }
  if (potential.nodeValue && original.nodeValue) {
    // Check text similarity
    const [similarity] = await SimilarityPipeline.calculateSimilarity(
      original.nodeValue,
      [potential.nodeValue]
    )
    return similarity;
  }
  // Else, if both have no value, that's still a good sign
  else if (potential.nodeValue == original.nodeValue) {
    return .25;
  }
  else if (original.estimated) {
    // If our text matches, we return 0.25.
    // While we mostly use the text + position score
    // to find elements, if we aren't searching for a
    // specific type of element we boost the node
    // value a little so if there is a group of
    // similar elements we'll use the one closest
    // to the actual value.  The main purpose of this
    // is because the siblings score can be a bit
    // can move us off the best element.
    if (original.text == potential.nodeValue && !original.tagName) {
      return .25;
    }
    // Do not penalize, as estimates can return
    // text from images or icons that aren't present in the page.
    return 0;
  }
  // If one has a value and the other doesn't, very bad sign...
  return -.5;
}

// Our text score is different from nodeValue, nodeValue is required to survive
// website refactoring, but text is always estimated directly from the current page
// Because of this, we prefer the levenstein distance to the similarity score
function getEstimatedTextScore(potential: ElementData, original: SearchElementData): number {
  if (!original.estimated) return 0;
  if (potential.text && original.text) {
    // Strip whitespace
    const cleanPotential = potential.text.replace(/\s+/g, ' ').toLowerCase();
    const cleanOriginal = original.text.replace(/\s+/g, ' ').toLowerCase();

    const distance = Math.min(
      levenshtein(cleanOriginal, cleanPotential),
      // The vLLM may omit decimals for $ if they are zero
      // Check with them added back in cause they'll only
      // help when it's actually helpful
      levenshtein(cleanOriginal + ".00", cleanPotential)
    );

    // Our scoring is non-linear.  If the original length is less than 5, then
    // even a few mis-matches can be a big penalty (eg, $0 => $0.00).  For this length, we simply lose
    // 10% for each change made
    if (cleanOriginal.length < 5) {
      return Math.max(-0.5, 1 - (distance / 5));
    }
    // For longer strings, we just
    else {
      return Math.max(-0.5, 1 - (distance / cleanOriginal.length));
    }
  }
  return 0;
}
function getValueParsingScore(potential: ElementData, original: SearchElementData) {
  if (!original.parsing) return 0;
  if (!potential.text) return -1;

  // When scoring for an estimate, we are only checking if we
  // can convert to the requested type.
  if (original.estimated) {
    const guessed = getValueParsing(potential.text, original.parsing.type);
    return (guessed.format)
      // If we have a format, this means the value is of the requested type.
      // However, we have some very relaxed parsing rules, so don't give it
      // the full weight.
      ? 0.75
      // If it can't be converted, then it's most likely not a match
      : -1;
  }
  else if (original.parsing.format) {
    const parsed = parseValue(potential.text, original.parsing)
    return (parsed)
      ? 1
      : -1;
  }
  return 0;
}

