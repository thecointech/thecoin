import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

// First, read the version from lerna.json
const rootFolder = fileURLToPath(new URL('..', import.meta.url));
const lernaJson = JSON.parse(readFileSync(`${rootFolder}/lerna.json`, 'utf8'));
let version = lernaJson.version;

// Strip prerelease suffix if --strip-prerelease flag is provided
// Converts "0.5.3-test.0" → "0.5.3"
if (process.argv.includes('--strip-prerelease')) {
  version = version.replace(/-(test|beta)\.\d+$/, '');
}

const now = new Date().toISOString();
// write these to a .env file
const raw = readFileSync(`${rootFolder}/environments/common.public.env`, 'utf8');
const updated = raw
  .replace(/TC_APP_VERSION=".*"/, `TC_APP_VERSION="${version}"`)
  .replace(/TC_DEPLOYED_AT=".*"/, `TC_DEPLOYED_AT="${now}"`);
writeFileSync(`${rootFolder}/environments/common.public.env`, updated);
console.log(`Updated version to ${version} at ${now}`);
