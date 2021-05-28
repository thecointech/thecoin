import { getEnvFile } from "./setenv";
import { exec } from "child_process";
import { exit } from "process";
import { readFileSync, writeFileSync } from "fs";

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

export async function copyEnvVarsLocal(outYamlFile: string) {
  const envFile = getEnvFile();
  const contents = readFileSync(envFile, 'utf8');
  const yamlVars = contents.split('\n')
    .filter(line => !line.startsWith('#'))
    .filter(line => !line.startsWith('WALLET_'))
    .filter(line => !line.startsWith('CERAMIC_'))
    .filter(line => !/^\s*$/.test(line))
    .map(line => line.split('=').join(': '))
    .join('\n  ')
    .trim();
  const asYaml = `env_variables:\n  ${yamlVars}`;
  writeFileSync(outYamlFile, asYaml);
}

function ShellCmd(cmd: string) {
  return new Promise<string>((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error.message);
        console.log(stdout);
        exit(1);
      }
      if (stderr) {
        resolve(stderr);
        return;
      }
      resolve(stdout);
    });
  })
}

// // print process.argv
// Consider removing custom scripts in favour of just calling this one.
// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });
