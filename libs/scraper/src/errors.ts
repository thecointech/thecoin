import type { DynamicInputEvent, SearchElementData, FoundElement, ValueEvent } from "@thecointech/scraper-types";

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

export class ValueEventError extends Error {
  event: ValueEvent
  constructor(event: ValueEvent) {
    super(`Read value error: ${event.eventName}`);
    this.event = event;
  }
}
