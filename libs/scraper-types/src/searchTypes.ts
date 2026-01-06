import type { ElementHandle, Page } from 'puppeteer';
import type { ElementData } from './elementDataType';

export type ValueType = "date"|"currency"|"phone"|"text"|"table";

export type ValueParsing = {
  type: ValueType,
  format: string|null,
}
export type ValueResult = {
  text: string,
  parsing: ValueParsing,
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

