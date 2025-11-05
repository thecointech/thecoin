
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Test } from '../src/types';
import { globSync } from 'glob';
import path from 'node:path';
// import { getTestData } from '@thecointech/scraper/testutils';

// TODO: de-dup with getTestData
export function getTests(testingPages: string): Test[] {
  const archivePath = join(testingPages, 'archive');

  // Find all elements in the archive
  const pattern = `${archivePath}/**/*-elm.json`
  const matched = globSync(pattern);
  return matched.map(match => {
    const matchedFolder = path.dirname(match);
    const folder = path.relative(archivePath, matchedFolder);
    const machedFilename = path.basename(match);
    const step = parseInt(machedFilename.split('-')[0])

    const element = machedFilename.replace('-elm.json', '')
    return {
      folder,
      step,
      element,
    }
  })

  // const dates = readdirSync(archivePath);
  // const allTests: Test[] = dates.flatMap(date => {
  //   const datePath = join(archivePath, date);
  //   const targets = readdirSync(datePath)
  //   return targets.flatMap(target => {
  //     const sectionFiles = readdirSync(join(datePath, target))
  //     return sectionFiles.flatMap(section => {
  //       const files = readdirSync(join(datePath, target, section))
  //       const elements = files
  //         .filter(file => file.endsWith('-elm.json'))
  //         .map(file => file.replace('-elm.json', ''))
  //         .sort()
  //       return elements.map(element => ({
  //           date,
  //           target,
  //           section,
  //           element,
  //           ...getTestMeta(join(datePath, target, section), element),
  //         })
  //       )
  //     })
  //   })
  // })
  // return allTests
}

function getTestMeta(path: string, name: string) {
  const metaPath = join(path, name, '__snapshots__')
  if (!existsSync(metaPath)) {
    return {}
  }
  // const allMeta = readdirSync(metaPath)

  // const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
  // return meta
  return {}
}
