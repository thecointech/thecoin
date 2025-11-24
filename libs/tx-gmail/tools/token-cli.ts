#!/usr/bin/env node
import { log } from '@thecointech/logging';
import { getTempSecret, setTempSecret, deleteTempSecret } from '@thecointech/secrets/temp';
import { getUniqueUrlKey, getUniqueTokenKey, getTokenUrl } from '../src/token';

// Simple CLI tool to allow recieving a token
// request from docker, getting the code, and returning
// it via bitwarden

async function main() {

  // NOTE!  This tool is always started in the 'prod' environment,
  // to ensure all library imports talk to live versions.  However,
  // the environment is passed in here as an argument, and is used
  // to reset the CONFIG_NAME so we load secrets from the right place.
  const envName = process.argv[2];
  const uniqueId = process.argv[3];
  if (!envName || !uniqueId) {
    log.error('Usage: token-cli <prod|prodtest> <unique-id>');
    log.error('The unique id should be provided by the docker container logs');
    process.exit(1);
  }

  process.env.CONFIG_NAME = envName;
  process.env.CONFIG_ENV = envName.replace('beta', '');

  const urlKey = getUniqueUrlKey(uniqueId);
  // Do not clear this on fetch, allows for multiple attempts
  const url = await getTempSecret(urlKey, false);
  try {
    const code = await getTokenUrl(url);
    await setTempSecret(getUniqueTokenKey(uniqueId), code);
    await deleteTempSecret(urlKey);
  }
  catch (e) {
    log.error('Failed to get token:', e);
    process.exit(1);
  }
}

await main();