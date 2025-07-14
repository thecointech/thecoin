import { copyFileSync, mkdirSync, readFileSync, writeFileSync, cpSync, readdirSync } from 'fs';

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
