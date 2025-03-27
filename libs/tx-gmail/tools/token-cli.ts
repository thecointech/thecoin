#!/usr/bin/env node
import { log } from '@thecointech/logging';
import { getTempSecret, setTempSecret, deleteTempSecret } from '@thecointech/secrets/temp';
import { getUniqueUrlKey, getUniqueTokenKey, getTokenUrl } from '../src/token';


async function main() {
  const uniqueId = process.argv[2];
  if (!uniqueId) {
    log.error('Usage: token-cli <unique-id>');
    log.error('The unique id should be provided by the docker container logs');
    process.exit(1);
  }

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