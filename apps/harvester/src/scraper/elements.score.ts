import { SimilarityPipeline } from "./similarity";
import { Coords, ElementData, ElementDataMin } from "./types";

// This scoring function reaaaaally needs to be replaced with
// a computed (learned) model, because manually scoring is just
// too easy to bias to right-nows problems
export async function scoreElement(potential: ElementData, original: ElementDataMin) {
  let score = 0;
  if (potential.tagName == original.tagName) score = score + 20;
  if (potential.selector == original.selector) score = score + 25;
  if (potential.font?.color == original.font?.color) score = score + 5;
  if (potential.font?.font == original.font?.font) score = score + 5;
  if (potential.font?.size == original.font?.size) score = score + 5;
  if (potential.font?.style == original.font?.style) score = score + 5;

  // metadata can be very helpful
  if (original.role !== undefined) {
    score += 20 * getRoleScore(potential.role, original.role);
  }
  if (original.label !== undefined) {
    score += 20 * await getLabelScore(potential.label, original.label);
  }
  if (original.coords !== undefined) {
    score += 20 * getPositionScore(potential.coords, original.coords);
  }

  // Actual data is the most valuable
  score += 40 * await getNodeValueScore(potential, original);
  score += 30 * await getSiblingScore(potential.siblingText, original.siblingText);

  // max score is 195
  return score;
}

//
// Get a score based on similarity of the potential's siblings to the original
export async function getSiblingScore(potentialSiblings?: string[], originalSiblings?: string[]) {
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
  // Downvote if one has siblings and the other doesn't
  return -0.25;
}

async function getLabelScore(potential: string|null, original: string|null) {
  if (potential && original) {
    const [score] = await SimilarityPipeline.calculateSimilarity(original, [potential])
    return score;
  }
  return 0;
}

function getRoleScore(potential: string|null, original: string|null) {
  if (potential || original) {
    return (potential == original)
      ? 1
      : -1; // Differing roles is a pretty bad sign
  }
  return 0;
}

function getPositionScore(potential: Coords, original: Coords) {
  const originalCenterX = original.left + (original.width / 2);
  const potentialCenterX = potential.left + (potential.width / 2);
  const diffX = Math.abs(originalCenterX - potentialCenterX);
  const diffY = Math.abs(original.centerY - potential.centerY);

  // Distance between centers, scaled by potential width/height
  // Should be between 0 and 1 if original is within potential, -ve outside it
  const scoreCenterX = 1 - (diffX / (potential.width / 2));
  const scoreCenterY = 1 - (diffY / (potential.height / 2));
  const scoreCenter = (scoreCenterX + scoreCenterY) / 2;

  // Score potential width/height, scaled by original width/height
  const scoreWidth = 1 - Math.abs(potential.width - original.width) / Math.max(potential.width, original.width);
  const scoreHeight = 1 - Math.abs(potential.height - original.height) / Math.max(potential.height, original.height);
  const scoreSize = (scoreWidth + scoreHeight) / 2;

  return Math.max(0, (scoreCenter + scoreSize) / 2);
}

async function getNodeValueScore(potential: ElementData, original: ElementDataMin) {
  if (potential.nodeValue && original.nodeValue) {
    // If both are $amounts, that's a pretty good sign
    if (
      original.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/) &&
      potential.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/)
    ) {
      return 0.75;
    }
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
  // If one has a value and the other doesn't, very bad sign...
  return -.5;
}
