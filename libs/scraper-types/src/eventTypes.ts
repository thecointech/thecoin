import type { ElementData } from "./elementDataType";
import type { ValueParsing } from "./searchTypes";

export type BaseEvent = {
  timestamp: number,
  id: string,
}

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
