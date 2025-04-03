import { getEnvVars } from "@thecointech/setenv";
import { exit } from "process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { spawn, exec as exec_cb } from 'child_process';
import { promisify } from 'util';
import { getSecret } from "@thecointech/secrets";
import { join } from 'path';

const exec = promisify(exec_cb);
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

// Similar to SetGCloudConfig, but firestore doesn't support named configs
async function SetFirecloudServiceAccount(envName: string) {
  // Hard-coded path means service accounts must be co-located to the env folder
  // Not ideal, but path of least resistance...
  const keyFilePath = join(
    process.env.THECOIN_SECRETS!,
    '..',
    'service-accounts',
    `${process.env[envName]}.json`
  )
  if (!existsSync(keyFilePath)) {
    throw new Error("Service Account not found at path: " + keyFilePath)
  }
  console.log("path: " + keyFilePath)
  process.env.GOOGLE_APPLICATION_CREDENTIALS=keyFilePath;
  // return ShellCmd(`yarn run -T firebase login --key-file ${keyFilePath}`);
}

//
// Deploy a firebase project
// Set firebase to a profile matching the current config
// Requires there be a matching profile defined in firebase.json
export async function FirebaseDeploy(envName: string) {
  await SetFirecloudServiceAccount(envName);
  await ShellCmd(`yarn run -T firebase use ${process.env.CONFIG_NAME}`)
  await ShellCmd("yarn run -T firebase deploy --only hosting");
}

//
export function gCloudDeploy() {
  const deploy = (process.env.SETTINGS == 'beta')
    ? "gcloud app deploy --quiet --version=beta --no-promote"
    : "gcloud app deploy --quiet"
  return ShellCmd(deploy);
}

export async function copyEnvVarsLocal(outYamlFile: string, additionalVars: Record<string, string> = {}, additionalSecrets: SecretKeyType[] = []) {

  // Get version from package.json
  const packageJson = JSON.parse(readFileSync(`${process.cwd()}/package.json`, 'utf8'));

  const secrets = await Promise.all(additionalSecrets.map(key => getSecret(key)));
  const env = {
    TC_APP_VERSION: packageJson.version,
    ...getEnvVars(),
    ...additionalVars,
    ...Object.fromEntries(secrets.map((s, i) => [additionalSecrets[i], s])),
  }
  const yamlVars = Object.entries(env)
    .filter(([key]) => !key.startsWith('#'))
    .filter(([key]) => !(key.startsWith('WALLET_') && !key.includes('_ADDRESS')))
    .filter(([key]) => !key.startsWith('CERAMIC_'))
    .filter(([key]) => !key.startsWith('GITHUB_'))
    .filter(([key]) => !key.endsWith('_SERVICE_ACCOUNT'))
    .filter(([key]) => key !== 'STORAGE_PATH' && key != 'TC_LOG_FOLDER' && !key.startsWith('USERDATA_INSTRUCTION'))
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

export async function copyNpmTokenHere(folder: URL) {
  // First, check we actually have a token
  const token = await getSecret("GithubPackageToken");
  if (!token) throw new Error('Cannot deploy without GH access token');

  const noToken = readFileSync(new URL('.npmrc', import.meta.url), 'utf8');
  const withToken = noToken.replace('<tokenhere>', token);
  writeFileSync(new URL('.npmrc', folder), withToken);
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
        exit(code ?? undefined);
      }
    });
  })
}
