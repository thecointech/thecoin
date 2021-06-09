import { Timestamp as ITimestamp } from "@google-cloud/firestore";
import { DateTime } from 'luxon';

type TimestampFns = {
  now: () => Timestamp;
  fromMillis: (n: number) => Timestamp;
  fromDate: (d: Date) => Timestamp;
}

/**
 * This class is a drop-in replacement for the various Firestore
 * & Datastore Timestamp classes.  It creates instances of the
 * appropriate type behind-the-scenes so we never have to
 * know what environment we are running under
 */
export class Timestamp extends ITimestamp {

  /**
   * Initialise this class with a concrete representation
   */
  static fns: TimestampFns;
  static init(imp: TimestampFns) {
    this.fns = imp;
  }

  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @return A new `Timestamp` representing the current date.
   */
  static now(): ITimestamp {
    return this.fns.now()
  }


  /**
   * Creates a new timestamp from the given date.
   *
   * @param date The date to initialize the `Timestamp` from.
   * @return A new `Timestamp` representing the same point in time as the
   * given date.
   */
  static fromDate(date: Date): ITimestamp {
    return this.fns.fromDate(date);
  }

  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds Number of milliseconds since Unix epoch
   * 1970-01-01T00:00:00Z.
   * @return A new `Timestamp` representing the same point in time as the
   * given number of milliseconds.
   */
  static fromMillis(milliseconds: number): ITimestamp {
    return this.fns.fromMillis(milliseconds);
  }
}

export function isDate(d: Timestamp|Date) : d is Date {
  return (d as Date).getFullYear != undefined;
}
export function isTimestamp(d: Timestamp|Date) : d is Timestamp {
  return (d as Timestamp).nanoseconds != undefined;
}
export function isDateTime(d?: Timestamp|DateTime) : d is DateTime {
  return DateTime.isDateTime(d);
}

export function AsDate(d: Timestamp|Date) : Date {
  if (isDate(d))
    return d;
  else return d.toDate();
}

export function toTimestamp(d?: DateTime) : Timestamp|undefined {
  return d
    ? Timestamp.fromMillis(d.toMillis())
    : d;
}
export function toDateTime(d?: Timestamp) : DateTime|undefined {
  return d
    ? DateTime.fromMillis(d.toMillis())
    : d;
}

