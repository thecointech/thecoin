
import path from 'node:path';
import type { FailingTest, Test, TestResult } from '../src/types';
import { getTestData } from './getTestData';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { getSnapshot, getSnapshots, type SnapshotData, type TestData } from '@thecointech/scraper-archive';

declare global {
  var allTests: TestData[];
}

export function getAllTests() {
  if (!global.allTests) {
    global.allTests = getTestData("*", "elm.json", "archive");
  }
  return global.allTests;
}
export function getTests(): Test[] {
  const r = getAllTests().flatMap(test => {
    return test.elements().map(e => ({
      key: test.key,
      ...e,
    }))
  })
  return r;
}

export function getTest(key: string): TestData {
  const test = getAllTests().find(test => test.key === key)
  if (!test) {
    throw new Error(`Test ${key} not found`)
  }
  return test
}

export function getFailing(): FailingTest[] {
  const failing = getAllTests().flatMap(test => {
    const failing = test.failing;
    if (!failing.length) return [];
    return failing.map(f => ({
      key: test.key,
      element: f,
    }))
  })
  return failing
}

export function getTestResults(key: string, element: string): TestResult {
  const test = getTest(key)
  return {
    original: getTestOriginalResult(test, element),
    search: getTestSearch(test, element),
    override: getElementOverride(test, element),
    snapshot: getTestSnapshotResults(test, element),
  }
}

export function getTestImagePath(key: string) {
  const test = getTest(key)
  return path.join(test.matchedFolder, `${test.step}.png`)
}

function getElementOverride(test: TestData, element: string) {
  return test.override(element);
}


function getTestOriginalResult(test: TestData, element: string) {

  const original = test.elm(element)
  if (!original) {
    throw new Error(`Element ${element} not found`)
  }
  return original
}

function getTestSnapshotResults(test: TestData, element: string) {
  const snapshots = getSnapshots(test.matchedFolder, element)
  return snapshots.map(snapshot => ({
    time: snapshot.timestamp.getTime(),
    result: getSnapshot(snapshot),
  }))
}
function getTestSearch(test: TestData, element: string) {
  return test.sch(element)
}

