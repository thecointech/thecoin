import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
//@ts-ignore -- annoying false positive
import { getSecret } from '@thecointech/secrets';
import { spawnSync } from 'child_process';
import { rmSync } from 'fs';
import { createInterface } from 'node:readline/promises';

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure we have the GH_PACKAGES_READ
const githubToken = await getSecret('GithubPackageToken');
process.env.GH_PACKAGES_READ = githubToken;
// Note: This requires the GH_PACKAGES_READ
await import('./prep-docker');

console.log("Enter Sudo Password to build Docker Image:")
// Read the sudo password from the console
const rl = createInterface(process.stdin, undefined, undefined, true)
const sudoPwd = await rl.question('sudo password: ');
rl.close();

const rootDir = join(__dirname, '../../..');
console.log("Building Docker Image from: ", rootDir);

// Build the Docker image using sudo
// const result = spawnSync('bash', [
//   '-c',
//   `echo "${sudoPwd}" | sudo -S docker build -t tx-processor -f "apps/tx-processor/docker/Dockerfile_local" --rm=false .`
// ], {
//   stdio: 'inherit',
//   cwd: rootDir // Run from the parent folder
// });

// // Clean up temporary files
// rmSync('./temp', { recursive: true, force: true });

// Check if the build was successful
// if (result.status !== 0) {
//   throw new Error('Failed to build Docker image');
// }
