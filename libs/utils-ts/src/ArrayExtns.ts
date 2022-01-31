export function isPresent<T>(t: T | undefined | null): t is T { return t !== undefined && t !== null; };
export function isDefined<T>(t: T | undefined): t is T { return t !== undefined; };
export function isFilled<T>(t: T | null): t is T { return t !== null; };

export function last<T>(arr: T[]) : T { return arr[arr.length - 1]; }
export function first<T>(arr: T[]) : T { return arr[0] }

