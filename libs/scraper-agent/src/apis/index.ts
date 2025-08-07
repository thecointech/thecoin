import { ApiEventFactory } from "./eventFactory";
import { IApiFactory } from "./interface";

declare global {
  var __tc_apiFactory: IApiFactory;
}

export function apis() {
  if (!global.__tc_apiFactory) {
    global.__tc_apiFactory = new ApiEventFactory();
  }
  return global.__tc_apiFactory;
}

export function setApi(api: IApiFactory) {
  if (global.__tc_apiFactory) {
    throw new Error("ApiFactory already initialized");
  }
  global.__tc_apiFactory = api;
}
