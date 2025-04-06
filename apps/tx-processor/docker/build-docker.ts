// import { spawnSync } from 'child_process';
// import { getSecret } from '@thecointech/secrets';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'fs';

// Get current directory
// const __dirname = dirname(fileURLToPath(import.meta.url));

// Verify token
const githubToken = process.env.GH_PACKAGES_READ;
if (!githubToken) {
  throw new Error('GH_PACKAGES_READ not found in environment');
}

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
      npmAlwaysAuth: true,
      npmAuthToken: githubToken
    }
  }
};

writeFileSync("./temp/.yarnrc.yml", JSON.stringify(yarnConfig, null, 2));

// Add an npmrc as well why not?
// writeFileSync("./temp/.npmrc", `//npm.pkg.github.com/:_authToken=${githubToken}\n@thecointech:registry=https://npm.pkg.github.com`);

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
