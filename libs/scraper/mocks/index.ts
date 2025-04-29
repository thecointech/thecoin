export * from './mock_replay.ts';
export * from '../src/puppeteer-init/rootFolder.ts'

export function newPage() {
  return {
    page: null,
    browser: null
  }
}

export async function replayEvents() {
  return {}
}

export function closeBrowser() {
  // Do nothing
}
