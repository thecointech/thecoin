import { getEnvVars } from "./setenv";
import { exit } from "process";
import { readFileSync, writeFileSync } from "fs";
import { join } from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

console.log(`Preparing deploy env: ${process.env.CONFIG_NAME}`);

// If we are pre-deploy, we require an explicit environment
if (!process.env.CONFIG_NAME) {
  console.error("Cannot deploy without explicit environment");
  exit(1);
}
// Only deploy production code
if (process.env.NODE_ENV !== "production") {
  console.error("Can only deploy production environments");
  exit(1);
}

//
// Set the gcloud CLI to the environment for this project
// NOTE: This is a global switch, so deploy's cannot
// be parralellized
export function SetGCloudConfig(envName: string) {
  return ShellCmd(`gcloud config configurations activate ${process.env[envName]}`);
}

//
// Set firebase to a profile matching the current config
// Requires there be a matching profile defined in firebase.json
export function FirebaseUseEnv() {
  return ShellCmd(`firebase use ${process.env.CONFIG_NAME}`)
}

export function gCloudDeploy() {
  const deploy = (process.env.SETTINGS == 'beta')
    ? "gcloud app deploy --version=beta --no-promote"
    : "gcloud app deploy"
  return ShellCmd(deploy);
}

export async function copyEnvVarsLocal(outYamlFile: string) {
  const env = getEnvVars();
  const yamlVars = Object.entries(env)
    .filter(([key]) => !key.startsWith('#'))
    .filter(([key]) => !(key.startsWith('WALLET_') && !key.includes('_ADDRESS')))
    .filter(([key]) => !key.startsWith('CERAMIC_'))
    .filter(([key]) => !key.startsWith('GITHUB_'))
    .filter(([key]) => !key.includes('_SERVICE_ACCOUNT='))
    .filter(([key]) => key !== 'STORAGE_PATH')
    .map(([key, val]) => {
      const sval = JSON.stringify(val);
      return [key, sval].join(': ');
    })
    .join('\n  ')
    .trim();
  const asYaml = `env_variables:\n  ${yamlVars}`;
  writeFileSync(outYamlFile, asYaml);
  return "Copied Env Files"
}

export async function copyNpmTokenHere(folder: string) {
  // First, check we actually have a token
  const token = process.env.GITHUB_PACKAGE_TOKEN;
  if (!token) throw new Error('Cannot deploy without GH access token');

  const noToken = readFileSync(join(__dirname, '.npmrc'), 'utf8');
  const withToken = noToken.replace('<tokenhere>', token);
  writeFileSync(join(folder, '.npmrc'), withToken);
  return "NPM token copied here";
}

//
// Remove old versions of the currently selected service
// Will leave 2 versions in prodtest, and 4 in prod
export async function removeOldAppVersions() {
  const { stdout } = await exec(`gcloud app versions list --format="value(version.id)" --sort-by="~version.createTime"`);
  // How many versions do we want to keep?
  const numToKeep = process.env.CONFIG_NAME == "prodtest"
    ? 2
    : 4;
  const versions = stdout
    .split('\n')
    .filter(v => v.length);

  const numVersions = versions.length;
  if (numVersions > numToKeep) {
    const versionArg = versions.slice(numToKeep).join(' ');
    console.log(`Deleting ${numVersions} versions: ${versionArg}`);
    await exec(`gcloud app versions delete ${versionArg} --quiet`)
  }
  else {
    console.log(`Not deleting old versions: only ${numVersions} of ${numToKeep} available`);
  }
}


export function ShellCmd(cmd: string, args: string[]=[]) {
  console.log("Running: " + cmd);
  return new Promise<void>((resolve) => {
    const proc = spawn(cmd, args, { shell: true, stdio: 'inherit' });
    proc.on('exit', function (code) {
      if (code == 0)
        resolve();
      else {
        console.error(`Exit code: ${code}`);
        exit(code);
      }
    });
  })
}
