// import { spawnSync } from 'child_process';
// import { getSecret } from '@thecointech/secrets';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'fs';

// Get current directory
// const __dirname = dirname(fileURLToPath(import.meta.url));

// Verify token
if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN not found in environment');
}
const tokenPrefix = process.env.GITHUB_TOKEN.substring(0, 4);
console.log(`Token prefix: ${tokenPrefix}... (length: ${process.env.GITHUB_TOKEN.length})`);

// Create temp directory
mkdirSync('./temp', { recursive: true });

// Copy yarn.lock locally
copyFileSync("../../yarn.lock", "./temp/yarn.lock");

// Copy environments
cpSync("../../environments", "./temp/environments", { recursive: true });

// Add packageManager to package.json & move here
const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const rootPackageJson = JSON.parse(readFileSync("../../package.json", "utf-8"));
packageJson.packageManager = rootPackageJson.packageManager;
// packageJson.devDependencies = {};
writeFileSync("./temp/package.json", JSON.stringify(packageJson, null, 2));

// Create .yarnrc.yml with GitHub auth
const yarnConfig = {
  nodeLinker: "node-modules",
  checksumBehavior: "ignore",
  npmScopes: {
    thecointech: {
      npmRegistryServer: "https://npm.pkg.github.com",
      npmAuthToken: process.env.GITHUB_TOKEN
    }
  }
};
console.log("Writing .yarnrc.yml with config:", {
  ...yarnConfig,
  npmScopes: {
    thecointech: {
      ...yarnConfig.npmScopes.thecointech,
      npmAuthToken: '***' // Hide token in logs
    }
  }
});
writeFileSync("./temp/.yarnrc.yml", JSON.stringify(yarnConfig, null, 2));

// // Build the Docker image
// const result = spawnSync('docker', [
//   'build',
//   '-t', 'tx-processor',
//   '--build-arg', `GITHUB_TOKEN=${githubToken}`,
//   '-f', `${__dirname}/Dockerfile`,
//   '--rm=false',
//   '..'  // Build context is the tx-processor directory
// ], {
//   stdio: 'inherit',
//   cwd: __dirname  // Run from the docker directory
// });

// // Clean up temporary files
// rmSync('./temp', { recursive: true, force: true });

// // Check if the build was successful
// if (result.status !== 0) {
//   throw new Error('Failed to build Docker image');
// }
