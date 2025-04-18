import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

// First, read the version from lerna.json
const rootFolder = fileURLToPath(new URL('..', import.meta.url));
const lernaJson = JSON.parse(readFileSync(`${rootFolder}/lerna.json`, 'utf8'));
const version = lernaJson.version;
const now = new Date().toISOString();
// write these to a .env file
const raw = readFileSync(`${rootFolder}/environments/common.public.env`, 'utf8');
const updated = raw
  .replace(/TC_APP_VERSION=".*"/, `TC_APP_VERSION="${version}"`)
  .replace(/TC_DEPLOYED_AT=".*"/, `TC_DEPLOYED_AT="${now}"`);
writeFileSync(`${rootFolder}/environments/common.public.env`, updated);
console.log(`Updated version to ${version} at ${now}`);
