
import path from 'node:path';
import type { Test, TestResult } from '../src/types';
import { getTestData } from './getTestData';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { SnapshotData, TestData, TestElmData } from '@thecointech/scraper-archive';

declare global {
  var allTests: TestData[];
}

export function getTests(): Test[] {
  if (!global.allTests) {
    global.allTests = getTestData("*", "elm.json", "archive");
  }
  const r = global.allTests.flatMap(test => {
    const elements = test.elements()
    return elements.map(element => {
      return {
        key: test.key,
        step: test.step,
        element: element.replace("-elm.json", ""),
      }
    })
  })

  return r;
}

export function getTest(key: string, element: string): TestData {
  const test = global.allTests.find(test => test.key === key)
  if (!test) {
    throw new Error(`Test ${key} not found`)
  }
  return test
}

export function getTestResults(key: string, element: string): TestResult {
  const test = getTest(key, element)
  return {
    original: getTestOriginalResult(test, element),
    search: getTestSearch(test, element),
    override: getElementOverride(test, element),
    snapshot: getTestSnapshotResults(test, element),
  }
}

export function getTestImagePath(key: string) {
  const test = getTest(key, "")
  return path.join(test.matchedFolder, `${test.step}.png`)
}

function getElementOverride(test: TestData, element: string) {
  return test.override(element);
}


function getTestOriginalResult(test: TestData, element: string) {

  const original = test.elm(element, false)
  if (!original) {
    throw new Error(`Element ${element} not found`)
  }
  return original
}

function getTestSnapshotResults(test: TestData, element: string) {
  // Get results of subsequent runs
  const runFolder = path.join(test.matchedFolder, "__snapshots__")
  if (!existsSync(runFolder)) {
    return []
  }
  const runFiles = readdirSync(runFolder)
  const runs = runFiles
    .map(run => run.match(`${element}-elm-(\\d+)\\.json`))
    .filter(run => run !== null)
    .map(run => {
      const runPath = path.join(runFolder, run[0])
      const runTime = parseInt(run[1])
      const runResult = JSON.parse(readFileSync(runPath, 'utf-8'))
      return {
        time: runTime,
        result: runResult as SnapshotData,
      }
  })
  return runs.sort((a, b) => a.time - b.time)
}
function getTestSearch(test: TestData, element: string) {
  return test.sch(element)
}

