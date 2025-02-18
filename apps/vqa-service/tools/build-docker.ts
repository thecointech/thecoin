import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, rmdirSync } from 'fs';

// Build arguments array
const buildArgs = ['build', '-t', 'vqa-service'];

// Check if SSL certificates are configured
const useSSL = process.env.VQA_SSL_CERTIFICATE_FILE && process.env.VQA_SSL_KEY_FILE;
console.log('Use SSL:', useSSL);

if (useSSL) {
  // Create temporary copies of the certificates in the build context
  const certFile = process.env.VQA_SSL_CERTIFICATE_FILE!;
  const keyFile = process.env.VQA_SSL_KEY_FILE!;

  if (existsSync(certFile) && existsSync(keyFile)) {
    // Copy files to build context
    mkdirSync('./temp', { recursive: true });
    copyFileSync(certFile, './temp/cert.pem');
    copyFileSync(keyFile, './temp/key.pem');

    buildArgs.push(
      '--build-arg', 'SSL_CERT_FILE=temp/cert.pem',
      '--build-arg', 'SSL_KEY_FILE=temp/key.pem'
    );
  } else {
    console.warn('SSL certificates not found:', { certFile, keyFile });
  }
}

// TODO: This key should be supplied when creating the container, rather than at build time.
if (process.env.VQA_API_KEY) {
  buildArgs.push('--build-arg', `API_ACCESS_KEY=${process.env.VQA_API_KEY}`);
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
