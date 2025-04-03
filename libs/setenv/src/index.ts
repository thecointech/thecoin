import { basename } from 'path';
import { existsSync, readFileSync } from 'fs';
import { projectUrl } from '@thecointech/setenv/projectUrl';
import { fileURLToPath } from 'url';
import de from 'dotenv';
import { expand } from './expand.js';


const projectRoot = process.cwd();
const LOG_NAME = basename(projectRoot);

export function getEnvFiles(cfgName?: string, onlyPublic?: boolean) {
  const files : URL[] = [];

  const envName = cfgName || process.env.CONFIG_NAME || (
    process.env.NODE_ENV == "production"
      ? "prod"
      : "development"
  );

  // Does the user have files on the system
  if (!onlyPublic) {
    const systemFolder = process.env.THECOIN_SECRETS;
    const systemFile = new URL(`${envName}.private.env`, `file://${systemFolder}/`)
    if (existsSync(systemFile)) {
      files.push(systemFile);
    }
    const commonFile = new URL(`common.private.env`, `file://${systemFolder}/`)
    if (existsSync(commonFile)) {
      files.push(commonFile);
    }
  }

  // If none found, is there any in the local repo folder?
  const repoUrl = new URL(`environments/${envName}.public.env`, projectUrl());
  if (existsSync(repoUrl)) {
    files.push(repoUrl);
  }

  // None found, throw
  if (files.length == 0) return files;

  // Beta versions share a lot with non-beta environments, so we merge them together
  if (envName.endsWith("beta")) {
    const nonBeta = getEnvFiles(envName.slice(0, -4), onlyPublic)
    files.push(...nonBeta)
  }
  return files;
}

export function getEnvVars(cfgName?: string, onlyPublic?: boolean) : Record<string, string|undefined> {
  const files = getEnvFiles(cfgName, onlyPublic);
  const raw = files.map(file => readFileSync(file, "ascii"));
  const parsed = raw.map(r => de.parse(r));
  const combined = parsed.reduce((acc, ex) => ({
    ...ex,
    ...acc, // later files have lower priority, do not overwrite existing values
  }), {
    LOG_NAME,
  });
  return expand(combined);
}

export function loadEnvVars(cfgName?: string) {
  // Load all environment files.
  const files = getEnvFiles(cfgName);
  files.forEach(path => de.config({path: fileURLToPath(path)}));
  expand(process.env);

    //  Set default name for logging
  if (!process.env.LOG_NAME) {
    process.env.LOG_NAME = LOG_NAME;
  }
}
