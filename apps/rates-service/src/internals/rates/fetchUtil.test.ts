import { DateTime } from 'luxon'
import { alignToNextBoundary } from './fetchUtils';
import { FXUpdateInterval } from './types';


it ("Searches back correctly", () => {
  const lastValidTill = DateTime.fromISO("2023-07-27T02:00:00");
  const nextValid = alignToNextBoundary(lastValidTill.toMillis(), FXUpdateInterval);
  expect(nextValid).toEqual(1690443090000) // 03:31:30
})

it ("searches forward correctly", () => {
  const lastValidTill = DateTime.fromISO("2023-07-27T11:00:00");
  const nextValid = alignToNextBoundary(lastValidTill.toMillis(), FXUpdateInterval);
  expect(nextValid).toEqual(1690475490000) // 12:31:30
})

it ("Correctly decides a barrier back", () => {
  const lastValidTill = DateTime.fromISO("2023-07-27T03:31:30");
  const nextValid = alignToNextBoundary(lastValidTill.toMillis(), FXUpdateInterval);
  expect(nextValid).toEqual(1690453890000) // 06:31:30
})

it ("Correctly decides a barrier back 2", () => {
  const lastValidTill = DateTime.fromISO("2023-07-27T03:31:29");
  const nextValid = alignToNextBoundary(lastValidTill.toMillis(), FXUpdateInterval);
  expect(nextValid).toEqual(1690443090000) // 03:31:30
})

it ("Correctly decides a barrier forward", () => {
  const lastValidTill = DateTime.fromISO("2023-07-27T12:31:30");
  const nextValid = alignToNextBoundary(lastValidTill.toMillis(), FXUpdateInterval);
  expect(nextValid).toEqual(1690486290000) // 15:31:30
})
