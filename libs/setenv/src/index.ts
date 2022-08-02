import { basename } from 'path';
import { existsSync, readFileSync } from 'fs';
import { projectUrl } from '@thecointech/setenv/projectUrl';
import { fileURLToPath } from 'url';
import de from 'dotenv';

const projectRoot = process.cwd();
const LOG_NAME = basename(projectRoot);

export function getEnvFiles(cfgName?: string, onlyPublic?: boolean) {
  const files : URL[] = [];

  // If this is not a development machine, just bail - we can't run
  // without our environment variables.  (This is mostly to avoid
  // looking for files when running on a production machine.)
  const systemFolder = process.env.THECOIN_ENVIRONMENTS;
  if (!systemFolder) return files;

  const envName = cfgName || process.env.CONFIG_NAME || (
    process.env.NODE_ENV == "production"
      ? "prod"
      : "development"
  );
  // Does the user have files on the system
  if (!onlyPublic) {
    const systemFile = new URL(`${envName}.private.env`, `file://${systemFolder}`)
    if (existsSync(systemFile)) files.push(systemFile);
  }

  // If none found, is there any in the local repo folder?
  const repoUrl = new URL(`environments/${envName}.public.env`, projectUrl());
  if (existsSync(repoUrl)) {
    files.push(repoUrl);
  }

  // None found, throw
  if (files.length == 0) {
    throw new Error(`Missing cfg files for: ${cfgName} (${repoUrl})`);
  }

  // Beta versions share a lot with non-beta environments, so we merge them together
  if (envName.endsWith("beta")) {
    const nonBeta = getEnvFiles(envName.slice(0, -4), onlyPublic)
    files.push(...nonBeta)
  }
  return files;
}

export function getEnvVars(cfgName?: string, onlyPublic?: boolean) : Record<string, string> {
  const files = getEnvFiles(cfgName, onlyPublic);
  return files
    .map(file => readFileSync(file))
    .reduce((acc, contents) => ({
    ...de.parse(contents),
    ...acc, // later files have lower priority, do not overwrite existing balues
  }), {
    LOG_NAME,
  });
}

export function loadEnvVars(cfgName?: string) {
  // Load all environment files.
  const files = getEnvFiles(cfgName);
  files.forEach(path => de.config({path: fileURLToPath(path)}))

    //  Set default name for logging
  if (!process.env.LOG_NAME) {
    process.env.LOG_NAME = LOG_NAME;
  }
}
