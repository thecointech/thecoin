////////////////////////////////////////////////////////////////////
// We are triggered by a cron job on Google App Engine, but
// we only have minute-level precision.  We set the trigger
// to the end of the minute we are fetching data for, but we
// may not be able to query our data providers at this exact time.
// We want to pause for a few seconds before running this script
// to ensure our upstream is ready for us before updatin

// How many seconds should we wait after the minute is completed
// so our data provider has the data ready for us?
export const BufferSeconds = 5;

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// milliseconds until the nearest minute.  May be negative.
export function msTillMinuteBoundary(time: number) {
  const p = 60 * 1000; // milliseconds in an minute
  return time - Math.round(time / p ) * p;
}

export async function waitTillBuffer() {
  let msTillBuffered = BufferSeconds - msTillMinuteBoundary(Date.now());
  if (msTillBuffered < 5)
    await sleep(msTillBuffered);
}
