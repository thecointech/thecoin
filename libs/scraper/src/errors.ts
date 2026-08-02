import type { DynamicInputEvent, SearchElementData, FoundElement, ValueEvent, ElementData } from "@thecointech/scraper-types";

export class ElementNotFoundError extends Error {
  element: SearchElementData
  bestCandidate: FoundElement|null
  constructor(element: SearchElementData, bestCandidate: FoundElement|null) {
    super('Element not found');
    this.element = element;
    this.bestCandidate = bestCandidate;
  }
}

export class PageNotInteractableError extends Error {
  errors: unknown[];
  constructor(errors: unknown[]) {
    super(`Page not interactable`);
    this.errors = errors;
  }
}

export class DynamicValueError extends Error {
  event: DynamicInputEvent
  values?: Record<string, string>
  constructor(event: DynamicInputEvent, values?: Record<string, string>) {
    super(`Dynamic value error: ${event.eventName}`);
    this.event = event;
    this.values = values;
  }
}

// Thrown when we cannot enter a value into an input field
// Input is the data describing the element we found (not the original search criteria)
export class InputValueError extends Error {
  input: ElementData
  constructor(input: ElementData) {
    super(`Input value error on ${input.inputType ?? 'unknown'}: ${input.selector} - ${input.tagName}`);
    this.input = input;
  }
}

export class ValueEventError extends Error {
  event: ValueEvent
  constructor(event: ValueEvent) {
    super(`Read value error: ${event.eventName}`);
    this.event = event;
  }
}
