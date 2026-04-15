
export function parseTime(timeToRun: string) {
  if (!/^\d{1,2}:\d{2}$/.test(timeToRun)) {
    throw new Error(`Invalid time format: ${timeToRun}`);
  }
  const [hour, minute] = timeToRun.split(':');
  const hourNumber = parseInt(hour, 10);
  const minuteNumber = parseInt(minute, 10);
  if (
    hourNumber < 0 || hourNumber > 23 ||
    minuteNumber < 0 || minuteNumber > 59
  ) {
    throw new Error(`Invalid time values: ${timeToRun}`);
  }
  return { hour: hourNumber, minute: minuteNumber };
}
