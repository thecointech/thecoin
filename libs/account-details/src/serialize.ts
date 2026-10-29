import { DateTime } from "luxon";

// Encrypted payloads are JSON, so non-JSON types must be converted
// before encryption and restored after.  DateTime is tagged so it
// can be restored unambiguously (a plain ISO string stays a string).
const DATETIME_TAG = "$dt";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;

export function toSerializable(value: unknown): unknown {
  if (DateTime.isDateTime(value)) return { [DATETIME_TAG]: value.toISO() };
  if (Array.isArray(value)) return value.map(toSerializable);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toSerializable(v)]));
  }
  return value;
}

export function fromSerializable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromSerializable);
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === DATETIME_TAG && typeof value[DATETIME_TAG] === "string") {
      return DateTime.fromISO(value[DATETIME_TAG] as string, { setZone: true });
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromSerializable(v)]));
  }
  return value;
}
