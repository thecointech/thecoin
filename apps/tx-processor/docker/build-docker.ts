import { spawnSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync } from 'fs';
import { getSecret } from '@thecointech/secrets';

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure we have the GH_PACKAGES_READ
const githubToken = await getSecret('GithubPackageToken');
process.env.GH_PACKAGES_READ = githubToken;

// Note: This requires the GH_PACKAGES_READ
await import('./prep-docker');

// Build the Docker image
const result = spawnSync('docker', [
  'build',
  '-t', 'tx-processor',
  '-f', `${__dirname}/Dockerfile`,
  '--rm=false',
  '..'  // Build context is the tx-processor directory
], {
  stdio: 'inherit',
  cwd: __dirname  // Run from the docker directory
});

// Clean up temporary files
rmSync('./temp', { recursive: true, force: true });

// Check if the build was successful
if (result.status !== 0) {
  throw new Error('Failed to build Docker image');
}
