import { spawnSync } from 'child_process';
import { existsSync, rmdirSync } from 'fs';

// Build arguments array
const buildArgs = ['build', '-t', 'vqa-service'];

// Add the build context
buildArgs.push('.');

// Run docker build
const result = spawnSync('docker', buildArgs, { stdio: 'inherit' });

// Clean up temporary files if they exist
if (existsSync('./temp')) {
  rmdirSync('./temp', { recursive: true });
}

process.exit(result.status || 0);
