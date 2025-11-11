import type { TestData } from "./testData";
import type { FoundElement } from "@thecointech/scraper-types";
import path from "node:path";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import type { TestElmData, SnapshotData } from "./types";

const SNAPSHOT_FOLDER = "__snapshots__";
export function saveSnapshot(test: TestData, element: string, timestamp: Date, original: TestElmData, found: FoundElement, candidates: FoundElement[]) {

  const snapshotFolder = path.join(test.matchedFolder, SNAPSHOT_FOLDER);
  if (!existsSync(snapshotFolder)) {
    mkdirSync(snapshotFolder, { recursive: true });
  }

  const snapshotFile = path.join(snapshotFolder, `${element}-elm-${timestamp.getTime()}.json`);

  const data = getWriteData(original, found, candidates);
  writeFileSync(snapshotFile, JSON.stringify(data, null, 2));
}

  // Useful things in a snapshot:
  //  - found element
  //  - expected results (if not found)
  //  - top 10 candidates
function getWriteData(original: TestElmData, found: FoundElement, candidates: FoundElement[]): SnapshotData {
  const matched = candidates.find(c => (
    c.data.selector == original.data.selector &&
    c.data.text == original.data.text
  ));

  const cleaned = toTestElmData(found);

  const top = candidates.slice(0, 10).map(toTestElmData);
  if (matched && matched != found) {
    return {
      found: cleaned,
      match: toTestElmData(matched),
      top,
    }
  }
  return {
    found: cleaned,
    top,
  }
}

function toTestElmData(found: FoundElement): TestElmData {
  const r = {
    ...found,
    element: undefined,
    data: {
      ...found.data,
      frame: undefined,
    }
  }
  return r;
}

export type SnapshotMeta = {
  timestamp: Date;
  filename: string;
}

export function getSnapshots(folder: string, element: string, limit=100): SnapshotMeta[] {
  const runFolder = path.join(folder, SNAPSHOT_FOLDER)
  if (!existsSync(runFolder)) {
    return []
  }
  const runFiles = readdirSync(runFolder)
  const runs = runFiles
    .map(run => run.match(`${element}-elm-(\\d+)\\.json`))
    .filter(run => run !== null)
    // sort by time, most recent first
    .sort((a, b) => parseInt(b![1]) - parseInt(a[1]))
    .slice(0, limit)
    .map(run => {
      const runPath = path.join(runFolder, run[0])
      const runTime = parseInt(run[1])
      return {
        timestamp: new Date(runTime),
        filename: runPath,
      }
  })
  return runs;
}

export function getSnapshot(meta: SnapshotMeta): SnapshotData {
  const r = JSON.parse(readFileSync(meta.filename, 'utf-8'))
  return r as SnapshotData
}
