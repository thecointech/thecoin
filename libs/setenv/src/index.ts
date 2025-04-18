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

  // Load any system-local definitions
  if (!onlyPublic && process.env.THECOIN_SECRETS) {
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

  // If we cannot find the project root, there is no environments to load
  const baseUrl = projectUrl();
  if (!baseUrl) {
    return files;
  }

  const addName = (name: string) => {
    const url = new URL(`environments/${name}.public.env`, baseUrl);
    if (existsSync(url)) {
      files.push(url);
    }
  };

  // Add common, if it exists
  addName("common");
  addName(envName);

  // None found, throw
  if (files.length == 0) return files;

  // Beta versions share a lot with non-beta environments, so we merge them together
  if (envName.endsWith("beta")) {
    const nonBeta = getEnvFiles(envName.slice(0, -4), onlyPublic)
    for (const f of nonBeta) {
      if (!files.includes(f)) {
        files.push(f);
      }
    }
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
