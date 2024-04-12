import { DateTime } from 'luxon'

export const toDateStr = (d: number|DateTime) =>
  DateTime.isDateTime(d)
    ? d.toLocaleString(DateTime.DATETIME_SHORT)
    : DateTime.fromMillis(d).toLocaleString(DateTime.DATETIME_SHORT)
