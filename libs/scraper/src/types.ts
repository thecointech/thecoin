import type currency from 'currency.js';
import type { DateTime } from 'luxon';
import type { HistoryRow } from './table';
import type { ElementHandle, Page } from 'puppeteer';

export type { HistoryRow };

// Generic result encompasses all of the above
export type ReplayResult = Record<string, string | DateTime | currency | HistoryRow[]>

export type ValueType = "date"|"currency"|"phone"|"text"|"table";

export type ValueParsing = {
  type: ValueType,
  format: string|null,
}
export type ValueResult = {
  text: string,
  parsing: ValueParsing,
}

export type BaseEvent = {
  timestamp: number,
  id: string,
}

export type Coords = {
  top: number,
  left: number,
  centerY: number,
  height: number,
  width: number,
}
export type Font = {
  font: string,
  color: string,
  size: string,
  style: string,
}
export type ElementData = {
  // The frames to dereference on our way to the data
  frame?: string
  // Note: always uppercase
  tagName: string,
  // HTML name attribute.  Not used in scoring, but is helpful
  // for grouping radio buttons together for VQA
  name?: string,
  // Options are not used in scoring, but are helpful
  // for determining the intent of an select in VQA
  options?: string[],
  // If tagName is INPUT, this will be the type
  // Note: inputType & role are always lowercase
  inputType?: string,
  role: string|null,

  selector: string,
  coords: Coords,
  label: string|null,
  // inner text
  text: string,
  // value of the actual node
  nodeValue?: string|null,
  font?: Font,
  siblingText?: string[],

  // Reference to parent element
  parentSelector?: string|null,
  parentTagName?: string,
}

export type SearchElementData = Partial<ElementData> & {
  // Matches eventName in AnyElementEvent
  eventName: string
  // Set to true if we are searching for an element
  // based on estimated data (eg from VQA service)
  estimated?: boolean,
  // If present, indicates the value is expected to
  // parseable as the given type.
  parsing?: ValueParsing,
};

export type ElementSearchParams = {
  page: Page,
  event: SearchElementData,
  timeout?: number,
  minScore?: number,
  maxTop?: number,
}

export type SearchElement = {
  element: ElementHandle<HTMLElement>,
  data: ElementData
}

export type ScoreElement = {
  score: number,
  components: Record<string, number>,
}

export type FoundElement = SearchElement & ScoreElement;

export type NavigationEvent = BaseEvent & {
  type: "navigation",
  to: string,
};

export type LoadEvent = BaseEvent & {
  type: "load",
} & BaseEvent;


export type UnloadEvent = {
  type: "unload",
} & BaseEvent;


export type BaseEventData =  {
  // Human name for the event.  Used
  // by ValueEvent to name the value read from the element,
  // and all for debugging/testing
  eventName: string,
} & BaseEvent & ElementData;

export type ClickEvent = {
  type: "click",
  clickX: number,
  clickY: number,
} & BaseEventData;

// Static input event.  Will be the same every run
export type InputEvent = {
  type: "input",
  value: string,
  hitEnter?: boolean,
  valueChange?: boolean,
} & BaseEventData;

// Dynamic input event.  Value is supplied each run
// Used for things like `amount`
export type DynamicInputEvent = {
  type: "dynamicInput",
  valueChange?: boolean,
} & BaseEventData;

// Not really an event, but something to read later
export type ValueEvent = {
  type: "value",
  parsing?: ValueParsing
} & BaseEventData;

export type AnyElementEvent = ClickEvent|InputEvent|DynamicInputEvent|ValueEvent;
export type AnyEvent = NavigationEvent|AnyElementEvent|UnloadEvent|LoadEvent;
