////////////////////////////////////////////////////////////////////
// We are triggered by a cron job on Google App Engine, but
// we only have minute-level precision.  We set the trigger
// to the end of the minute we are fetching data for, but we
// may not be able to query our data providers at this exact time.
// We want to pause for a few seconds before running this script
// to ensure our upstream is ready for us before updatin

// How many seconds should we wait after the minute is completed
// so our data provider has the data ready for us?
export const BufferMs = 5 * 1000;

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// milliseconds until the nearest minute.  If we have just passed
// a minute boundary, it will be negative as the nearest minute
// is -ve milliseconds away
export function msTillNearestMinute(time: number) {
  const p = 60 * 1000; // milliseconds in an minute
  return (Math.round(time / p ) * p) - time;
}

export async function waitTillBuffer(minimumWait: number = 0) {
  const msTillBuffered = BufferMs + msTillNearestMinute(Date.now());
  const waitTime = Math.max(minimumWait, msTillBuffered);
  if (waitTime > 5)
    await sleep(waitTime);
}
