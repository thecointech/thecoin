import type { ElementData, SearchElementData } from "./types";


const EquivalentInputTypes = [
  // All of the following attributes tend to show up looking the same on the page
  ['text', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'search', 'tel', 'time', 'url', 'week'],
  ['checkbox', 'radio'],
  ['submit', 'reset', 'button'],
]

export function getInputTypeScore(potential: ElementData, original: SearchElementData): number {
  if (original.tagName !== 'INPUT' || potential.tagName !== 'INPUT') return 0;

  const originalType = original.inputType ?? 'text';
  const potentialType = potential.inputType ?? 'text';

  if (potentialType === originalType) return 1;
  if (EquivalentInputTypes.find(t => t.includes(potentialType) && t.includes(originalType))) {
    return 0.5;
  }
  return 0;
}
