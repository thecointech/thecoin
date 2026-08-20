import type { AxiosError, AxiosResponse } from "axios";


export function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data: deepCopy(data),
    status: 200,
    statusText: "Success",
    headers: {} as any,
    config: {} as any,
  }
}

// Build a rejection that mimics a failed server response, so that
// callers using `axios.isAxiosError` (e.g. UI error handling) behave
// the same in mocks as they would against the real broker-service.
// NOTE: `axios.isAxiosError` is just a duck-type check for `isAxiosError === true`
// (not `instanceof AxiosError`), so we build a plain object rather than importing
// the real AxiosError class - this keeps us decoupled from however `axios` itself
// happens to be mocked in any given test environment.
export function buildErrorResponse<T>(status: number, data: T, message?: string): AxiosError<T> {
  const response: AxiosResponse<T> = {
    data: deepCopy(data),
    status,
    statusText: "Error",
    headers: {} as any,
    config: {} as any,
  };
  return {
    isAxiosError: true,
    name: "AxiosError",
    message: message ?? (data as any)?.message ?? "Request failed",
    code: String(status),
    config: response.config,
    response,
    toJSON: () => ({}),
  } as AxiosError<T>;
}

function deepCopy(obj: any): any {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {} as any;
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}
