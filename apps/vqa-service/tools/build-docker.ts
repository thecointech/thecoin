import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { getSecret, SecretNotFoundError } from '@thecointech/secrets';

// Build arguments array
const buildArgs = ['build', '-t', 'vqa-service'];

// Check if SSL certificates are configured
const sslPublic = await getSecret("VqaSslCertPublic")
const sslPrivate = await getSecret("VqaSslCertPrivate")
const useSSL = sslPublic && sslPrivate;
console.log('Use SSL:', useSSL);

if (useSSL) {
  // Create temporary copies of the certificates in the build context
  // (NOTE: This hasn't been verified yet)
  mkdirSync('./temp', { recursive: true });
  writeFileSync('./temp/cert.pem', sslPublic);
  writeFileSync('./temp/key.pem', sslPrivate);

  buildArgs.push(
    '--build-arg', 'SSL_CERT_FILE=temp/cert.pem',
    '--build-arg', 'SSL_KEY_FILE=temp/key.pem'
  );
}

// TODO: This key should be supplied when creating the container, rather than at build time.
try {
  const apiKey = await getSecret('VqaApiKey');
  buildArgs.push('--build-arg', `API_ACCESS_KEY=${apiKey}`);
} catch (e) {
  if (e instanceof SecretNotFoundError) {
    console.warn('VQA API key not found');
  } else {
    throw e;
  }
}

// Add the build context
buildArgs.push('.');

// Run docker build
const result = spawnSync('docker', buildArgs, { stdio: 'inherit' });

// Clean up temporary files if they exist
if (existsSync('./temp')) {
  rmdirSync('./temp', { recursive: true });
}

process.exit(result.status || 0);
