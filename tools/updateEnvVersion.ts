import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

// First, read the version from lerna.json
const rootFolder = fileURLToPath(new URL('..', import.meta.url));
const lernaJson = JSON.parse(readFileSync(`${rootFolder}/lerna.json`, 'utf8'));
const version = lernaJson.version;
const now = new Date().toISOString();
// write these to a .env file
writeFileSync(`${rootFolder}/environments/common.public.env`, `TC_APP_VERSION="${version}"\nTC_DEPLOYED_AT="${now}"`);
console.log(`Updated version to ${version} at ${now}`);
